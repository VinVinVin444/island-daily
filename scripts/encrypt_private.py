#!/usr/bin/env python3
"""从独立私有仓库读取个人分析，在内存中加密，公共仓库只保存密文。
绝不能将 private repo 的 JSON 写进本仓库、构建产物或者日志。
"""
import os, json, re, base64, hashlib, secrets, sys
from pathlib import Path
import requests
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

def b64(raw): return base64.b64encode(raw).decode('ascii')

def run():
    token=os.getenv('ISLAND_PRIVATE_READ_TOKEN','').strip()
    password=os.getenv('ISLAND_PRIVATE_PASSWORD','')
    private_repo=os.getenv('ISLAND_PRIVATE_REPO','').strip()
    if not (token and password and private_repo):
        print('私人内容尚未配置：跳过个人分析加密')
        return
    if len(password)<20:
        raise ValueError('私人密钥至少20个字符，请在 Actions Secrets 中重新设置')
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',private_repo):
        raise ValueError('无效的私人仓库名称')
    api=f'https://api.github.com/repos/{private_repo}/contents/latest.json'
    response=requests.get(api,headers={
        'Authorization':f'Bearer {token}','Accept':'application/vnd.github+json',
        'X-GitHub-Api-Version':'2022-11-28'},timeout=25)
    response.raise_for_status()
    body=response.json()
    source=base64.b64decode(body['content'],validate=False)
    if len(source)>100_000: raise ValueError('私人简报超出大小限制')
    content=json.loads(source)
    if not isinstance(content,dict) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}',content.get('date','')):
        raise ValueError('私人简报缺少日期')
    items=content.get('items')
    if not isinstance(items,list) or not 0<len(items)<=30: raise ValueError('私人简报条目不正确')
    clean=[]
    for it in items:
        if not isinstance(it,dict): continue
        url=it.get('url','')
        impact=it.get('impact','')
        if isinstance(url,str) and url.startswith('https://') and isinstance(impact,str) and 0<len(impact)<2000:
            clean.append({'url':url,'impact':impact})
    if not clean:
        print('私人简报中没有有效条目，本次不更新密文')
        return
    plaintext=json.dumps({'date':content['date'],'items':clean},ensure_ascii=False,separators=(',',':')).encode('utf8')
    salt=secrets.token_bytes(16)
    nonce=secrets.token_bytes(12)
    iterations=600_000
    kdf=PBKDF2HMAC(algorithm=hashes.SHA256(),length=32,salt=salt,iterations=iterations)
    key=kdf.derive(password.encode('utf8'))
    encrypted=AESGCM(key).encrypt(nonce,plaintext,b'island-daily-private-v1')
    output={'version':1,'kdf':'PBKDF2-SHA256','cipher':'AES-256-GCM','iterations':iterations,
            'salt':b64(salt),'nonce':b64(nonce),'ciphertext':b64(encrypted)}
    path=Path(__file__).resolve().parents[1]/'data/private/personal.enc.json'
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf8')
    print('私人简报已加密；公开仓库只会写入不含明文的密文文件。')

if __name__=='__main__': run()
