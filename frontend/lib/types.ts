export interface MdaUser {
  guid: string
  email: string | null
  phone: string | null
  created_date: string
  status: string | null
}

export interface CreateMdaUserInput {
  guid: string
  email?: string | null
  phone?: string | null
  status?: string | null
}

export interface UpdateMdaUserInput {
  email?: string | null
  phone?: string | null
  status?: string | null
}
