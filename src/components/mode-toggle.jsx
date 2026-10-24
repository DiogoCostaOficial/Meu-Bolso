import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { cn } from '../lib/utils'

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button
                    title="Alternar tema"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-custom-gold dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-400 dark:focus:ring-custom-gold"
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-amber-500 dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-amber-400 dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Alternar tema</span>
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-950 dark:ring-gray-800 z-50">
                    <div className="px-1 py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={cn(
                                        active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                        theme === 'dark' ? 'font-semibold text-custom-gold' : 'text-gray-900 dark:text-gray-100',
                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                    )}
                                >
                                    <Moon className="mr-2 h-4 w-4 text-amber-400" />
                                    Tema Escuro
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme("light")}
                                    className={cn(
                                        active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                        theme === 'light' ? 'font-semibold text-custom-gold' : 'text-gray-900 dark:text-gray-100',
                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm'
                                    )}
                                >
                                    <Sun className="mr-2 h-4 w-4 text-amber-500" />
                                    Tema Claro
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
