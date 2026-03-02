import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

declare module 'next-auth' {
  interface User {
    backendToken?: string
    backendRefreshToken?: string
    backendUserId?: string
    backendNombre?: string
    backendEmail?: string
    backendRequiere2FA?: boolean
    backendVerificacionId?: string
  }

  interface Session {
    backendToken?: string
    backendRefreshToken?: string
    backendUserId?: string
    backendNombre?: string
    backendEmail?: string
    backendRequiere2FA?: boolean
    backendVerificacionId?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false

      try {
        const oauthUrl = `${API_BASE_URL}/auth/oauth`
        console.log('[auth] signIn → POST', oauthUrl, { provider: account.provider, email: user.email })

        const response = await fetch(oauthUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: account.provider,
            providerId: account.providerAccountId,
            email: user.email,
            nombre: user.name || user.email.split('@')[0],
          }),
        })

        if (!response.ok) {
          const body = await response.text()
          console.error('[auth] signIn → backend respondió', response.status, body)
          return false
        }

        const result = await response.json()
        const data = result.data

        if (data.requiere2FA) {
          user.backendRequiere2FA = true
          user.backendVerificacionId = data.verificacionId
          user.backendUserId = data.usuarioId
          user.backendNombre = data.nombre
          user.backendEmail = user.email ?? undefined
          return true
        }

        user.backendToken = data.token
        user.backendRefreshToken = data.refreshToken
        user.backendUserId = data.usuarioId
        user.backendNombre = data.nombre

        return true
      } catch (err) {
        console.error('[auth] signIn → error de red al llamar al backend:', err)
        return false
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken
        token.backendRefreshToken = user.backendRefreshToken
        token.backendUserId = user.backendUserId
        token.backendNombre = user.backendNombre
        token.backendEmail = user.backendEmail ?? user.email ?? undefined
        token.backendRequiere2FA = user.backendRequiere2FA
        token.backendVerificacionId = user.backendVerificacionId
      }
      return token
    },

    async session({ session, token }) {
      session.backendToken = token.backendToken as string | undefined
      session.backendRefreshToken = token.backendRefreshToken as string | undefined
      session.backendUserId = token.backendUserId as string | undefined
      session.backendNombre = token.backendNombre as string | undefined
      session.backendEmail = token.backendEmail as string | undefined
      session.backendRequiere2FA = token.backendRequiere2FA as boolean | undefined
      session.backendVerificacionId = token.backendVerificacionId as string | undefined
      return session
    },
  },
})
