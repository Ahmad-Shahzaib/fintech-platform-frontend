"use client";

import { useSidebar } from "@/context/SidebarContext";
import { CalenderIcon, GridIcon, PageIcon } from "@/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import path from "path";
import React from "react";
import Image from "next/image";

export default function UserSidebar() {
  const { isExpanded, toggleSidebar, isHovered, setIsHovered, isMobileOpen, toggleMobileSidebar } =
    useSidebar();
  const pathname = usePathname();

  const userMenuItems = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      path: "/dashboard",

    },
    {
      icon: <CalenderIcon />,
      name: "Top Up Request",
      path: "/top-up",
    },
    {
      icon: <CalenderIcon />,
      name: "My Top Ups",
      path: "/my-top-up",
    },
    {
      name: "RePayments",
      path: "/repayments",
      icon: <PageIcon />,
      subItems: [
        { name: "Make Payment", path: "/make-payment", pro: false },
        { name: "Payment History", path: "/payment-history", pro: false },
      ],
    },
    {
      name: "Help & Support",
      path: "/help-support",
      icon: <PageIcon />,
      subItems: [
        { name: "FAQ", path: "/faq", pro: false },
        { name: "Contact Support", path: "/contact-us", pro: false },
      ],
    },
    {
      name: "Settings",
      path: "/settings",
      icon: (
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.4291 8.99998H16.0541C15.9166 8.47498 15.7041 7.97498 15.4416 7.52498L16.4041 6.56248C16.7041 6.26248 16.7041 5.76248 16.4041 5.46248L14.5541 3.61248C14.2541 3.31248 13.7541 3.31248 13.4541 3.61248L12.4916 4.57498C12.0416 4.31248 11.5416 4.09998 11.0166 3.96248V2.58748C11.0166 2.16248 10.6791 1.83748 10.2541 1.83748H7.76659C7.34159 1.83748 7.00409 2.17498 7.00409 2.58748V3.96248C6.47909 4.09998 5.97909 4.31248 5.52909 4.57498L4.56659 3.61248C4.26659 3.31248 3.76659 3.31248 3.46659 3.61248L1.61659 5.46248C1.31659 5.76248 1.31659 6.26248 1.61659 6.56248L2.57909 7.52498C2.31659 7.97498 2.10409 8.47498 1.96659 8.99998H0.591589C0.166589 8.99998 -0.158411 9.33748 -0.158411 9.74998V12.2375C-0.158411 12.6625 0.178839 12.9875 0.591589 12.9875H1.96659C2.10409 13.5125 2.31659 14.0125 2.57909 14.4625L1.61659 15.425C1.31659 15.725 1.31659 16.225 1.61659 16.525L3.46659 18.375C3.76659 18.675 4.26659 18.675 4.56659 18.375L5.52909 17.4125C5.97909 17.675 6.47909 17.8875 7.00409 18.025V19.4C7.00409 19.825 7.34159 20.15 7.76659 20.15H10.2541C10.6791 20.15 11.0041 19.8125 11.0041 19.4V18.025C11.5291 17.8875 12.0291 17.675 12.4791 17.4125L13.4416 18.375C13.7416 18.675 14.2416 18.675 14.5416 18.375L16.3916 16.525C16.6916 16.225 16.6916 15.725 16.3916 15.425L15.4291 14.4625C15.6916 14.0125 15.9041 13.5125 16.0416 12.9875H17.4166C17.8416 12.9875 18.1666 12.65 18.1666 12.2375V9.74998C18.1791 9.32498 17.8416 8.99998 17.4291 8.99998ZM9.01659 13.7875C7.16659 13.7875 5.65409 12.275 5.65409 10.425C5.65409 8.57498 7.16659 7.06248 9.01659 7.06248C10.8666 7.06248 12.3791 8.57498 12.3791 10.425C12.3791 12.275 10.8666 13.7875 9.01659 13.7875Z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex-col justify-between bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isExpanded || isHovered ? "w-[290px]" : "w-[90px]"
        } hidden lg:flex`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => !isExpanded && setIsHovered(false)}
    >
      <div className=" overflow-hidden">
        {/* Logo */}
        <div className=" p-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="rounded-lg ">
             <Image
                width={120}
                height={120}
                src="/images/logo/auth-logo12.png"
                alt="Logo"
              />
            </div>
            
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {userMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {(isExpanded || isHovered) && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
