from dotenv import load_dotenv
import logging
import requests

load_dotenv()  # .env fayldagi o'zgaruvchilarni yuklaydi
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

import os
import asyncio
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator


# --- Config ---
# Prefer environment variables; fall back to defaults only for local testing.
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "7279803385:AAHbUlhVJJaRO9rHUF0VFsW5iTBFxzXlONM")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "1013889724")

TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}" if TELEGRAM_BOT_TOKEN else ""


async def send_telegram_message(text: str, chat_id: Optional[str] = None) -> None:
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set")
    cid = chat_id or TELEGRAM_CHAT_ID
    if not cid:
        raise RuntimeError("TELEGRAM_CHAT_ID is not set")
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {"chat_id": cid, "text": text}
    # Use requests.post, but run it in a thread to avoid blocking the event loop
    def _post():
        return requests.post(url, data=payload, timeout=20)
    import asyncio as _asyncio
    resp = await _asyncio.to_thread(_post)
    try:
        data = resp.json()
    except Exception:
        data = None
    if resp.status_code != 200 or not data or not data.get("ok"):
        logging.error("Telegram send error: status=%s body=%s", resp.status_code, resp.text)
        raise RuntimeError(f"Telegram API error: {resp.text}")


# --- Payload models ---
class ContactPayload(BaseModel):
    name: str = Field(..., min_length=1)
    family: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=3)
    email: Optional[EmailStr] = None
    order: Optional[str] = None


class OrderItem(BaseModel):
    name: str
    qty: int = Field(..., ge=0)


class OrderPayload(BaseModel):
    email: EmailStr
    name: str
    company: Optional[str] = None
    phone: str
    country: Optional[str] = None
    total: float = Field(..., ge=0)
    items: List[OrderItem]

    @validator("items")
    def must_have_items(cls, v):
        if not v:
            raise ValueError("items must not be empty")
        return v


class ChatPayload(BaseModel):
    name: Optional[str] = None
    message: str = Field(..., min_length=1)


# --- App ---
app = FastAPI(title="IBDB Server", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz():
    return {"ok": True}


@app.get("/healthz/telegram")
async def healthz_telegram(text: str = "IBDB telegram health check"):
    try:
        await send_telegram_message(text)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/contact")
async def api_contact(payload: ContactPayload):
    logging.info("/api/contact received: %s", payload.model_dump())
    text = (
        "Yangi kontakt so'rovi\n"
        f"Ism: {payload.name} {payload.family}\n"
        f"Telefon: {payload.phone}\n"
        f"Email: {payload.email or '-'}\n"
        f"Tafsilot: {payload.order or '-'}"
    )
    try:
        await send_telegram_message(text)
        logging.info("/api/contact sent to Telegram")
        return {"ok": True}
    except Exception as e:
        logging.exception("/api/contact failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/order")
async def api_order(payload: OrderPayload):
    logging.info("/api/order received: %s", payload.model_dump())
    items_lines = "\n".join([f"- {it.name}: {it.qty} kg" for it in payload.items])
    text = (
        "Yangi buyurtma\n"
        f"Ism: {payload.name}\n"
        f"Kompaniya: {payload.company or '-'}\n"
        f"Telefon: {payload.phone}\n"
        f"Email: {payload.email}\n"
        f"Davlat: {payload.country or '-'}\n"
        f"Jami: {payload.total:.2f} USD\n"
        f"Mahsulotlar:\n{items_lines}"
    )
    try:
        await send_telegram_message(text)
        logging.info("/api/order sent to Telegram")
        return {"ok": True}
    except Exception as e:
        logging.exception("/api/order failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def api_chat(payload: ChatPayload):
    logging.info("/api/chat received: %s", payload.model_dump())
    text = f"Live chat xabari\nKimdan: {payload.name or '-'}\nMatn: {payload.message}"
    try:
        await send_telegram_message(text)
        logging.info("/api/chat sent to Telegram")
        return {"ok": True}
    except Exception as e:
        logging.exception("/api/chat failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/telegram/webhook")
async def telegram_webhook(req: Request):
    data = await req.json()
    # Minimal example: echo incoming messages to your admin chat
    try:
        msg = data.get("message") or data.get("edited_message")
        if msg and msg.get("text"):
            user = msg.get("from", {})
            user_name = (user.get("first_name") or "") + " " + (user.get("last_name") or "")
            incoming = f"TG dan yangi xabar\nKimdan: {user_name.strip() or user.get('username') or 'anon'}\nMatn: {msg['text']}"
            await send_telegram_message(incoming)
    except Exception:
        # ignore errors on webhook processing to avoid retries
        pass
    return {"ok": True}


# --- Debug helpers ---
@app.get("/debug/config")
async def debug_config():
    return {
        "ok": True,
        "has_token": bool(TELEGRAM_BOT_TOKEN),
        "chat_id": TELEGRAM_CHAT_ID[:6] + "***" if TELEGRAM_CHAT_ID else None,
    }


@app.post("/debug/echo")
async def debug_echo(req: Request):
    try:
        data = await req.json()
    except Exception:
        data = None
    logging.info("/debug/echo received: %s", data)
    return {"ok": True, "echo": data}


# --- Run: uvicorn server.app:app --reload ---

