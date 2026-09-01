import { Resend } from 'resend'
import dotenv from 'dotenv'
dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTP(email, otp, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Your Verification Code - Gagan C B Portfolio',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc;">
          <div style="background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0;">Verify Your Email</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Hi ${name || 'there'}, here's your verification code</p>
            </div>
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px;">Your OTP Code</p>
              <p style="color: #ffffff; font-size: 42px; font-weight: 900; letter-spacing: 0.15em; margin: 0; font-family: 'DM Mono', monospace;">${otp}</p>
            </div>
            <p style="color: #64748b; font-size: 13px; text-align: center; line-height: 1.6;">
              This code expires in <strong>10 minutes</strong>. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              Sent from Gagan C B Portfolio &mdash; Automated verification email
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('[EMAIL] Resend error:', error)
      return false
    }

    console.log('[EMAIL] OTP sent to:', email, 'Message ID:', data?.id)
    return true
  } catch (err) {
    console.error('[EMAIL] Failed to send OTP:', err.message)
    return false
  }
}

export async function sendWelcomeEmail(email, name) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to Gagan C B Portfolio!',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #f8fafc;">
          <div style="background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
            <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">Welcome, ${name}!</h1>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              Your account has been created successfully. You can now log in and track your activity.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 12px 32px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 14px;">Log In Now</a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              Sent from Gagan C B Portfolio
            </p>
          </div>
        </body>
        </html>
      `
    })
    return true
  } catch (err) {
    console.error('[EMAIL] Failed to send welcome email:', err.message)
    return false
  }
}
