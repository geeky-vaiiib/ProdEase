'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
  title: string;
  description: string;
  itemName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  trigger?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export function DeleteConfirmationDialog({
  title,
  description,
  itemName,
  onConfirm,
  isLoading = false,
  trigger,
  variant = 'destructive',
}: DeleteConfirmationDialogProps) {
  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{description}</p>
            {itemName && (
              <p className="font-medium text-foreground">
                Item: <span className="text-destructive">{itemName}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Specialized variants for common use cases
export function DeleteOrderDialog({
  orderReference,
  onConfirm,
  isLoading = false,
}: {
  orderReference: string;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <DeleteConfirmationDialog
      title="Delete Manufacturing Order"
      description="Are you sure you want to delete this manufacturing order? This will remove all associated work orders and progress data."
      itemName={orderReference}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

export function DeleteStockItemDialog({
  itemName,
  onConfirm,
  isLoading = false,
}: {
  itemName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <DeleteConfirmationDialog
      title="Delete Stock Item"
      description="Are you sure you want to delete this stock item? This will remove all inventory records and transaction history."
      itemName={itemName}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

export function DeleteWorkCenterDialog({
  workCenterName,
  onConfirm,
  isLoading = false,
}: {
  workCenterName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <DeleteConfirmationDialog
      title="Delete Work Center"
      description="Are you sure you want to delete this work center? This will affect all associated manufacturing orders and work orders."
      itemName={workCenterName}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}

export function DeleteWorkOrderDialog({
  workOrderReference,
  onConfirm,
  isLoading = false,
}: {
  workOrderReference: string;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <DeleteConfirmationDialog
      title="Delete Work Order"
      description="Are you sure you want to delete this work order? This will remove all progress data and time tracking."
      itemName={workOrderReference}
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  );
}
