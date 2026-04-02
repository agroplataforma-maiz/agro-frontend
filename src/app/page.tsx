import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HomeRedirectPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('agro_token')?.value
  const rol = cookieStore.get('agro_rol')?.value

  if (token && rol) {
    redirect('/dashboard')
  }

  redirect('/login')
}
