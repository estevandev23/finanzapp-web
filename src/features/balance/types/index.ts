export interface Balance {
  totalIngresos: number
  totalGastos: number
  totalAhorros: number
  totalAhorrosDesdeIngresos: number
  totalDeudas: number
  totalPrestamos: number
  dineroDisponible: number
}

export interface MetodoBalance {
  metodo: string
  totalIngresos: number
  totalGastos: number
  balance: number
}

export interface BalancePorMetodo {
  metodos: MetodoBalance[]
}
