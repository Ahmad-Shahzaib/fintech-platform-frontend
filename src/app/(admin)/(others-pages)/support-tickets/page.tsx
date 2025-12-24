"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchAdminTickets } from "@/redux/thunk/adminTicketsThunk";
import SupportTicketsTable from "@/components/tickets/SupportTicketsTable";

const Page = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAdminTickets({ page: 1 }));
  }, [dispatch]);

  return (
    <div>
      <SupportTicketsTable />
    </div>
  );
};

export default Page;