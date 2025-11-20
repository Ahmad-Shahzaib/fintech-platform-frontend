"use client";

import { AddUserModalDetail } from "@/components/tables/AddUserModalDetail";
import React, { useState } from "react";

const Page = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAddUser = (user: any) => {
        console.log("New User Added:", user);
        // Add API call or logic here...
        setIsOpen(false); // Close modal after adding
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Add User
            </button>

            <AddUserModalDetail
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onAddUser={handleAddUser}
            />
        </div>
    );
};

export default Page;
