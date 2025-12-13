import NextAuth, { type NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Email from 'next-auth/providers/email'

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
const GITHUB_ID = process.env.GITHUB_CLIENT_ID || process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET || process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET
if (process.env.NODE_ENV !== 'production') {
  console.info('[Auth][Dev] GITHUB_ID set:', Boolean(GITHUB_ID))
}
if ((GITHUB_ID && !GITHUB_SECRET) || (!GITHUB_ID && GITHUB_SECRET)) {
  console.warn('[Auth][Warn] GITHUB_CLIENT_ID/SECRET tidak lengkap. Pastikan keduanya diisi dengan benar.')
}
if (GITHUB_ID && GITHUB_SECRET) {
  providers.push(GitHub({ 
    clientId: GITHUB_ID, 
    clientSecret: GITHUB_SECRET,
    // Izinkan linking akun lintas provider berdasarkan email yang sama saat development
    // Aman dimatikan otomatis di production
    allowDangerousEmailAccountLinking: process.env.NODE_ENV !== 'production' || process.env.NEXTAUTH_ALLOW_DANGEROUS_LINKING === 'true'
  }))
}

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
      async sendVerificationRequest({ identifier, url, provider }) {
        try {
          const { createTransport } = await import('nodemailer')
          const transport = createTransport(provider.server as unknown as string)
          const { host } = new URL(url)
          const result = await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n${url}\n`,
            html: `<p>Sign in ke <strong>${host}</strong></p><p><a href="${url}">Klik di sini untuk masuk</a></p>`
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
      async sendVerificationRequest({ identifier, url, provider }) {
        try {
          const { createTransport } = await import('nodemailer')
          const transport = createTransport(provider.server as unknown as string)
          const { host } = new URL(url)
          const result = await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n${url}\n`,
            html: `<p>Sign in ke <strong>${host}</strong></p><p><a href="${url}">Klik di sini untuk masuk</a></p>`
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
          await prisma.user.update({
            where: { id: user.id },
            data: {
              name: user.name || undefined,
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
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(token as any).id = (user as { id?: string })?.id ?? token.sub ?? ''
        // Preserve user data from OAuth providers
        if (user.name) token.name = user.name
        if (user.email) token.email = user.email
        if (user.image) token.picture = user.image
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
          ;(token as any).provider = account.provider
        }
        // propagate username if present on user (e.g., from DB adapter)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((user as any).username) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(token as any).username = (user as any).username
        }
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
        ;(session.user as any).id = token.sub
      }
      
      // Preserve user data from OAuth providers
      if (token.name) session.user.name = token.name
      if (token.email) session.user.email = token.email
      if (token.picture) session.user.image = token.picture
      // expose provider ke session agar UI bisa menentukan sumber avatar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((token as any).provider) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).provider = (token as any).provider
      }
      // copy username from token if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((token as any).username) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).username = (token as any).username
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
            // Prioritize OAuth provider image over database image
            // Only use database image if no OAuth image is available
            if (!session.user.image && user.image) {
              session.user.image = user.image
            }
            // ensure username is included in session
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(session.user as any).username = user.username || (session.user as any).username
            // surface status for client UI if needed
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(session.user as any).isSuspended = user.isSuspended
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(session.user as any).suspendedUntil = user.suspendedUntil ? user.suspendedUntil.toISOString() : null
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(session.user as any).isBanned = Boolean(user.bannedAt)
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


