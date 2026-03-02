export async function register() {
  // Fuerza IPv4 en las resoluciones DNS del proceso Node.js.
  // Soluciona UND_ERR_CONNECT_TIMEOUT en Windows donde undici/fetch
  // intenta IPv6 primero y no tiene salida a internet (OAuth de Google / GitHub).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setDefaultResultOrder } = await import('dns')
    setDefaultResultOrder('ipv4first')
  }
}
