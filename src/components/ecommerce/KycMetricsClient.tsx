"use client";

import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import { EcommerceMetrics } from './EcommerceMetrics';

export default function KycMetricsClient() {
  const { data: kycData } = useAppSelector((state) => state.kycStatus ?? { data: null });
  const kycStatus = kycData?.status ?? null;

  return <EcommerceMetrics kycStatus={kycStatus} />;
}
