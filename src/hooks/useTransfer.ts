import { useState } from 'react';

export const useTransfer = () => {
  const [showTransferModal, setShowTransferModal] = useState<string | null>(null);
  const [transferStep, setTransferStep] = useState<'input' | 'confirm'>('input');
  const [transferAddress, setTransferAddress] = useState('');

  const openTransfer = (id: string) => {
    setShowTransferModal(id);
    setTransferStep('input');
    setTransferAddress('');
  };

  const closeTransfer = () => {
    setShowTransferModal(null);
    setTransferStep('input');
    setTransferAddress('');
  };

  const confirmTransfer = () => {
    setTransferStep('confirm');
  };

  const goBackToInput = () => {
    setTransferStep('input');
  };

  return {
    showTransferModal,
    transferStep,
    transferAddress,
    setTransferAddress,
    openTransfer,
    closeTransfer,
    confirmTransfer,
    goBackToInput
  };
};