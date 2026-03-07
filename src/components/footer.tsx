'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { censorName } from '@/lib/formatters'
import { mainConfig } from '@/lib/layout-config'
import Image from 'next/image'
import { Ticket, User, Trophy, TrendingUp, Menu, X, LogOut, Shield, Home, Plus, Instagram } from 'lucide-react'
import { FaAdjust } from "react-icons/fa";
import { BsWhatsapp } from 'react-icons/bs'

export function Footer() {

  return (
    <footer className={`${mainConfig} flex justify-between items-center bg-branco dark:bg-cinza-escuro text-cinza text-1xl dark:text-branco lg:px-12 pt-8 pb-8 flex-wrap`}>
        <p>Copyright © 2026, Tronco da sorte, Todos os direitos reservados.</p>
        <ol className='flex gap-4'>
            <li><Link href="/" className='flex dark:text-branco items-center text-1xl gap-1 hover:text-azul-claro'><Instagram className='w-[15px] h-[15px]'/>Instagram</Link></li>
            <li><Link href="/" className='flex dark:text-branco items-center text-1xl gap-1 hover:text-azul-claro'><BsWhatsapp className='w-[15px] h-[15px]' />Whatsapp</Link></li>
        </ol>
      
    </footer>
  )
}
