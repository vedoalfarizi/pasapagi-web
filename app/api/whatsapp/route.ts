import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';
  
  // Read WA_PHONE from server-side environment variables, ensuring it remains hidden from the client.
  const waPhone = process.env.WA_PHONE;

  if (!waPhone) {
    return new NextResponse('WhatsApp number is not configured on the server.', { status: 500 });
  }

  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
  return NextResponse.redirect(waUrl);
}
