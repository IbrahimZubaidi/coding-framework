import asyncio
import hashlib
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

def is_sha256(password_hash_str):
    return len(password_hash_str) == 64 and "$" not in password_hash_str

def hash_sha256(password):
    hash_obj = hashlib.new("SHA256")
    hash_obj.update(password.encode())
    return hash_obj.hexdigest()

def _verify_password_sha256(password, password_hash_str):
    return hash_sha256(password) == password_hash_str

async def verify_password_sha256(password, password_hash_str):
    return await asyncio.to_thread(_verify_password_sha256, password, password_hash_str)

async def hash_password(password: str) -> str:
    return await asyncio.to_thread(password_hash.hash, password)

async def verify_password(password: str, hashed: str) -> bool:
    return await asyncio.to_thread(password_hash.verify, password, hashed)
