import { NextResponse } from 'next/server';
import { SERVER_URL } from '@/api/utils/baseUrl';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, phone, message, source, email, project_type, projectType } = body;

    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();
    const trimmedMessage = message?.trim() || '';

    // Compulsory fields: name and phone
    if (!trimmedName || trimmedName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (!trimmedPhone || !/^[+\d\s().-]{7,30}$/.test(trimmedPhone)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone or WhatsApp number (minimum 7 digits).' },
        { status: 400 }
      );
    }

    let saved = false;
    let savedData = null;

    // 1. Forward to Express backend API
    try {
      const backendUrl = SERVER_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const backendRes = await fetch(`${backendUrl}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          phone: trimmedPhone,
          message: trimmedMessage,
          email: email?.trim() || null,
          project_type: project_type || projectType || null,
          source: source || 'Portfolio Contact Form',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const resData = await backendRes.json().catch(() => null);
      if (backendRes.ok && resData?.success) {
        saved = true;
        savedData = resData.data;
      }
    } catch (err) {
      console.error('Backend contact enquiry forward error:', err.message);
    }

    if (!saved) {
      return NextResponse.json(
        {
          error:
            'Unable to securely save your details right now. Please try again or reach out directly at Anooprawat123123@gmail.com.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Thank you. Your message has been received. Anup Rawat will reach out promptly.',
      data: savedData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unable to submit your details. Please try again.' },
      { status: 500 }
    );
  }
}
