import razorpay
from fastapi import HTTPException


def create_payment_link(
    live_key_id: str,
    live_key_secret: str,
    amount: float,
    description: str,
):
    client = razorpay.Client(auth=(live_key_id, live_key_secret))

    try:
        response = client.payment_link.create(
            {
                "amount": int(amount * 100),
                "currency": "INR",
                "accept_partial": False,
                "description": description,
                "reminder_enable": True,
                "notes": {"product": "PDF to PPT Condensation"},
                "callback_url": "https://densair.vercel.app/",
                "callback_method": "get",
            }
        )
        return response["short_url"]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error creating payment link: {str(e)}"
        )
