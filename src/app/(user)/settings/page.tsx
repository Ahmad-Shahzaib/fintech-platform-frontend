import UpdatePasswordPage from '@/components/password/UpdatePassword'
import UserInfoCard from '@/components/user-profile/UserInfoCard'
import React from 'react'

const page = () => {
    return (
        <div>
            <UserInfoCard />
            <UpdatePasswordPage />
        </div>
    )
}

export default page