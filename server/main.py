from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from telegram_utils import send_telegram_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # yoki frontend domenini yozing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/order")
async def order(request: Request):
    try:
        data = await request.json()
        message = f"Yangi buyurtma: {data.get('product_name')} - {data.get('phone')}"
        result = await send_telegram_message(message)
        return {"status": "success", "telegram_result": result}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# Client-side JavaScript code to send a test order
"""
fetch("http://127.0.0.1:8000/order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ product_name: "Mahsulot", phone: "+998901234567" })
})
.then(res => res.json())
.then(data => alert(data.status))
.catch(err => alert("order failed"));
"""