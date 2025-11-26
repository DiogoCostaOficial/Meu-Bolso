import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Moon, Sun, Laptop } from 'lucide-react'
import { useTheme } from './theme-provider'
import { cn } from '../lib/utils'

export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:text-gray-400 dark:focus:ring-gray-800">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
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
                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-950 dark:ring-gray-800">
                    <div className="px-1 py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme("light")}
                                    className={cn(
                                        active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-100'
                                    )}
                                >
                                    <Sun className="mr-2 h-4 w-4" />
                                    Light
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={cn(
                                        active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-100'
                                    )}
                                >
                                    <Moon className="mr-2 h-4 w-4" />
                                    Dark
                                </button>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => setTheme("system")}
                                    className={cn(
                                        active ? 'bg-gray-100 dark:bg-gray-800' : '',
                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900 dark:text-gray-100'
                                    )}
                                >
                                    <Laptop className="mr-2 h-4 w-4" />
                                    System
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
