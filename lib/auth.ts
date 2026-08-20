import NextAuth, { type NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Email from 'next-auth/providers/email'

// --- Email Template Logic ---
const sendVerificationRequest = async ({ identifier, url, provider }: any) => {
  try {
    const { createTransport } = await import('nodemailer')
    const transport = createTransport(provider.server as unknown as string)
    
    const brandColor = "#16A34A"
    const backgroundColor = "#f9fafb"
    const textColor = "#1f2937"
    const buttonColor = "#ffffff"

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Masuk ke RuangProyek</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    
    body { 
      font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      background-color: #f8fafc; 
      color: #1e293b; 
      margin: 0; 
      padding: 0; 
      -webkit-font-smoothing: antialiased; 
    }
    .container { 
      max-width: 600px; 
      margin: 40px auto; 
      padding: 0 20px; 
    }
    .card { 
      background-color: #ffffff; 
      border-radius: 24px; 
      overflow: hidden; 
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); 
      border: 1px solid #f1f5f9; 
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
      padding: 48px 20px; 
      text-align: center; 
    }
    .logo { 
      color: white; 
      font-size: 28px; 
      font-weight: 800; 
      letter-spacing: -0.05em; 
      text-decoration: none; 
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-box {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .logo span { font-weight: 400; opacity: 0.9; }
    .content { 
      padding: 48px 40px; 
      text-align: center; 
    }
    .welcome-badge {
      display: inline-block;
      padding: 6px 12px;
      background-color: #ecfdf5;
      color: #059669;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 20px;
    }
    h1 { 
      font-size: 24px; 
      font-weight: 800; 
      color: #0f172a; 
      margin-bottom: 16px; 
      letter-spacing: -0.025em;
    }
    p { 
      font-size: 16px; 
      line-height: 1.6; 
      color: #475569; 
      margin-bottom: 24px; 
    }
    .button-container { margin: 32px 0; }
    .button { 
      background-color: #10b981; 
      color: #ffffff !important; 
      padding: 18px 40px; 
      border-radius: 16px; 
      font-weight: 700; 
      text-decoration: none; 
      display: inline-block; 
      transition: all 0.2s ease; 
      box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.25);
    }
    .footer { 
      padding: 32px; 
      text-align: center; 
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
    }
    .footer-text {
      font-size: 13px; 
      color: #94a3b8;
      margin: 4px 0;
    }
    .link-alt { 
      word-break: break-all; 
      color: #10b981; 
      font-size: 12px; 
      text-decoration: none;
      background: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      display: block;
      margin-top: 24px;
    }
    .security-note {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">
          <div class="logo-box">Ruang<span>Proyek</span></div>
        </div>
      </div>
      <div class="content">
        <div class="welcome-badge">Keamanan Akun</div>
        <h1>Akses Dashboard Anda</h1>
        <p>Klik tombol di bawah ini untuk masuk ke akun Anda di <strong>RuangProyek</strong>. Tautan ini akan kadaluarsa secara otomatis dalam 24 jam untuk menjaga keamanan akun Anda.</p>
        
        <div class="button-container">
          <a href="${url}" class="button">Masuk ke RuangProyek</a>
        </div>
        
        <div class="security-note">
          Jika tombol tidak berfungsi, salin dan tempel URL berikut ke browser Anda:
          <span class="link-alt">${url}</span>
        </div>
        
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
          Jika Anda tidak meminta email ini, Anda dapat mengabaikannya dengan aman.
        </p>
      </div>
      <div class="footer">
        <p class="footer-text"><strong>RuangProyek Team</strong></p>
        <p class="footer-text">Platform Manajemen Proyek & Kolaborasi Tim</p>
        <p class="footer-text" style="margin-top: 12px;">&copy; 2026 RuangProyek. Seluruh hak cipta dilindungi.</p>
      </div>
    </div>
  </div>
</body>
</html>
`
    const result = await transport.sendMail({
      to: identifier,
      from: provider.from,
      subject: `Masuk ke RuangProyek`,
      text: `Masuk ke RuangProyek\n\nKlik tautan berikut untuk masuk ke akun Anda:\n${url}\n\nJika Anda tidak meminta email ini, silakan abaikan.`,
      html: html
    })
    console.log('[Email] SMTP accepted:', result.accepted, 'rejected:', result.rejected, 'response:', result.response)
    if (result.rejected && result.rejected.length > 0) {
      throw new Error(`SMTP rejected recipients: ${result.rejected.join(', ')}`)
    }
  } catch (error) {
    console.error('[Email] SMTP send error:', error)
    throw error
  }
}

// Mulai tanpa Credentials; hanya OAuth & Email magic link
const providers: NextAuthConfig['providers'] = []

// Google (explicit clientId/clientSecret with fallbacks)
const GOOGLE_ID = process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET
if (process.env.NODE_ENV !== 'production') {
  console.info('[Auth][Dev] GOOGLE_ID set:', Boolean(GOOGLE_ID))
}
if ((GOOGLE_ID && !GOOGLE_SECRET) || (!GOOGLE_ID && GOOGLE_SECRET)) {
  console.warn('[Auth][Warn] GOOGLE_CLIENT_ID/SECRET tidak lengkap. Pastikan keduanya diisi dengan benar.')
}
if (GOOGLE_ID && GOOGLE_SECRET) {
  providers.push(Google({
    clientId: GOOGLE_ID,
    clientSecret: GOOGLE_SECRET,
    // Izinkan linking akun lintas provider berdasarkan email yang sama saat development
    // Aman dimatikan otomatis di production
    allowDangerousEmailAccountLinking: process.env.NODE_ENV !== 'production' || process.env.NEXTAUTH_ALLOW_DANGEROUS_LINKING === 'true'
  }))
}

// GitHub (support multiple env naming conventions)
const GITHUB_ID = process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID || 'missing-client-id-in-vercel'
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET || 'missing-client-secret-in-vercel'

console.log('[Auth] Initializing GitHub Provider. ID length:', GITHUB_ID?.length, 'Secret length:', GITHUB_SECRET?.length)

providers.push(GitHub({
  clientId: GITHUB_ID,
  clientSecret: GITHUB_SECRET,
  // Izinkan linking akun lintas provider berdasarkan email yang sama saat development
  // Aman dimatikan otomatis di production
  allowDangerousEmailAccountLinking: process.env.NODE_ENV !== 'production' || process.env.NEXTAUTH_ALLOW_DANGEROUS_LINKING === 'true'
}))

// Email (magic link) — supports EMAIL_SERVER or individual SMTP vars
const EMAIL_SERVER = process.env.EMAIL_SERVER
const EMAIL_FROM = process.env.EMAIL_FROM
const EMAIL_SERVER_HOST = process.env.EMAIL_SERVER_HOST
const EMAIL_SERVER_PORT = process.env.EMAIL_SERVER_PORT
const EMAIL_SERVER_USER = process.env.EMAIL_SERVER_USER
const EMAIL_SERVER_PASSWORD = process.env.EMAIL_SERVER_PASSWORD

// Gunakan Gmail SMTP jika EMAIL_SERVER_USER adalah Gmail
if (EMAIL_FROM && EMAIL_SERVER_USER && EMAIL_SERVER_PASSWORD) {
  const isGmail = EMAIL_SERVER_USER.includes('@gmail.com')

  if (isGmail) {
    // Konfigurasi Gmail SMTP + logging pengiriman email
    providers.push(Email({
      server: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: EMAIL_SERVER_USER,
          pass: EMAIL_SERVER_PASSWORD
        },
        secure: false,
        tls: {
          rejectUnauthorized: false
        }
      },
      from: EMAIL_FROM,
      sendVerificationRequest
    }))
  } else if (EMAIL_SERVER || (EMAIL_SERVER_HOST && EMAIL_SERVER_USER && EMAIL_SERVER_PASSWORD)) {
    // Fallback ke konfigurasi SMTP custom
    const server = EMAIL_SERVER
      ? EMAIL_SERVER
      : {
        host: EMAIL_SERVER_HOST,
        port: EMAIL_SERVER_PORT ? Number(EMAIL_SERVER_PORT) : 587,
        auth: { user: EMAIL_SERVER_USER as string, pass: EMAIL_SERVER_PASSWORD as string }
      }

    providers.push(Email({
      server,
      from: EMAIL_FROM,
      sendVerificationRequest
    }))
  }
}

export const authOptions: NextAuthConfig = {
  // Adapter diperlukan terutama untuk provider Email (verification tokens, users, sessions)
  adapter: PrismaAdapter(prisma),
  providers,
  debug: process.env.NODE_ENV !== 'production',
  trustHost: true,
  logger: {
    error(code, ...message) {
      console.error('[NextAuth][Error]', code, ...message)
    },
    warn(code, ...message) {
      console.warn('[NextAuth][Warn]', code, ...message)
    },
    debug(code, ...message) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[NextAuth][Debug]', code, ...message)
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('SignIn event:', { user, account, profile })

      // Update user data in database if needed
      if (user && user.id) {
        try {
          // Prefer image from provider profile if available (ensures latest Google/GitHub avatar)
          // Google returns `picture`, GitHub returns `avatar_url`
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const providerImage = (profile as any)?.picture || (profile as any)?.image || (profile as any)?.avatar_url || user.image || undefined
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { name: true }
          })

          await prisma.user.update({
            where: { id: user.id },
            data: {
              // Only update name if it's currently empty in database
              name: dbUser?.name ? undefined : (user.name || undefined),
              email: user.email || undefined,
              image: providerImage,
            }
          })
        } catch (error) {
          console.error('Error updating user data:', error)
        }
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      // Enforce suspended/banned rules at login
      try {
        if (!user?.id) return true
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isSuspended: true, suspendedUntil: true, suspendedReason: true, bannedAt: true, bannedReason: true }
        })
        if (!dbUser) return true
        if (dbUser.bannedAt) {
          const params = new URLSearchParams({ error: 'AccessDenied', reason: 'banned', message: dbUser.bannedReason || 'Akun Anda dibanned.' })
          return `/auth/error?${params.toString()}`
        }
        if (dbUser.isSuspended) {
          // if suspendedUntil is set and in the past, auto clear suspension
          if (dbUser.suspendedUntil && dbUser.suspendedUntil < new Date()) {
            await prisma.user.update({ where: { id: user.id }, data: { isSuspended: false, suspendedUntil: null, suspendedReason: null } })
            return true
          }
          const reason = dbUser.suspendedReason || 'Akun Anda disuspend.'
          const params = new URLSearchParams({ error: 'AccessDenied', reason: 'suspended', message: reason, until: dbUser.suspendedUntil ? dbUser.suspendedUntil.toISOString() : '' })
          return `/auth/error?${params.toString()}`
        }
      } catch (e) {
        // Jangan blokir login jika terjadi error tak terduga (mis. DB timeout)
        console.error('[Auth][signIn] Unexpected error, allowing login:', e)
        return true
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      return `${baseUrl}/dashboard`
    },
    // token.picture akan diprioritaskan dari data profil provider saat login
    // agar avatar langsung akurat meski DB belum ter-update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account, profile, trigger, session }: any) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (token as any).id = (user as { id?: string })?.id ?? token.sub ?? ''
        // Preserve user data from OAuth providers
        if (user.name) token.name = user.name
        if (user.email) token.email = user.email
        // Only store image URL in token (NEVER base64 — causes 494 cookie overflow)
        if (user.image && !user.image.startsWith('data:')) token.picture = user.image
        // Ambil foto dari profil provider saat login pertama kali / setiap login
        if (account?.provider === 'github' && profile?.avatar_url) {
          token.picture = profile.avatar_url
        }
        if (account?.provider === 'google' && (profile?.picture || profile?.image)) {
          token.picture = profile.picture || profile.image
        }
        // simpan provider terakhir yang digunakan (google/github/email)
        if (account?.provider) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ; (token as any).provider = account.provider
        }
        // propagate username if present on user (e.g., from DB adapter)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((user as any).username) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ; (token as any).username = (user as any).username
        }
      }

      // Handle session updates (e.g. from updateSession() on client)
      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name
        if (session.user.username) (token as any).username = session.user.username
        // Only store image in token if it's a URL (not base64) to prevent cookie bloat
        if (session.user.image && !session.user.image.startsWith('data:')) {
          token.picture = session.user.image
        } else if (session.user.image?.startsWith('data:')) {
          // Wipe base64 from token — session callback will fetch from DB
          token.picture = undefined
        }
      }

      // Safety: never let a base64 image live in the JWT (causes 494 errors)
      if (token.picture && (token.picture as string).startsWith('data:')) {
        token.picture = undefined
      }

      return token
    },
    async session({ session, token }) {
      // Ensure user object exists to avoid runtime errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!session.user) (session as any).user = {}
      // Add user ID to session
      if (token.sub) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (session.user as any).id = token.sub
      }

      // Preserve user data from OAuth providers
      if (token.name) session.user.name = token.name
      if (token.email) session.user.email = token.email
      if (token.picture) session.user.image = token.picture
      // expose provider ke session agar UI bisa menentukan sumber avatar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((token as any).provider) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (session.user as any).provider = (token as any).provider
      }
      // copy username from token if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((token as any).username) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (session.user as any).username = (token as any).username
      }

      // Fetch user data from database to get the latest image and data
      if (token.sub) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { id: true, name: true, email: true, image: true, username: true, isSuspended: true, suspendedUntil: true, bannedAt: true }
          })

          if (user) {
            // Update session with database data
            session.user.name = user.name || session.user.name
            session.user.email = user.email || session.user.email
            
            // Only use image from DB if it's a URL (not base64 — that would bloat the cookie)
            if (user.image && !user.image.startsWith('data:')) {
              session.user.image = user.image
            } else if (!user.image) {
              // No image set, clear it
              session.user.image = undefined as any
            }
            // If DB has base64, clear session image so it's blank until user re-uploads
            else if (user.image?.startsWith('data:')) {
              session.user.image = undefined as any
            }

            // Ensure extra fields are added correctly to session.user
            const userExtra = session.user as any
            userExtra.username = user.username || userExtra.username
            userExtra.isSuspended = user.isSuspended
            userExtra.suspendedUntil = user.suspendedUntil ? user.suspendedUntil.toISOString() : null
            userExtra.isBanned = Boolean(user.bannedAt)
          } else {
            // Check if it's an admin
            const admin = await prisma.admin.findUnique({
              where: { id: token.sub },
              select: { id: true, name: true, username: true }
            })
            
            if (admin) {
              const adminExtra = session.user as any
              session.user.name = admin.name || session.user.name
              adminExtra.username = admin.username || adminExtra.username
              adminExtra.role = 'admin'
              adminExtra.isAdmin = true
            }
          }
        } catch (error) {
          console.error('Error fetching user data for session:', error)
          // Keep existing session data if database fetch fails
        }
      }

      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-key-change-me-32-chars-minimum-1234',
  session: { strategy: 'jwt' }
}

// Export handlers + auth functions for NextAuth v5 (single initialization)
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
