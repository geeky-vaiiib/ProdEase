'use client';

import React, { useState } from 'react';
import { Plus, Calendar, Package, User, Hash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useData } from '@/contexts/data-context';

interface NewOrderData {
  finishedProduct: string;
  quantity: number;
  scheduledStartDate: string;
  dueDate: string;
  assignee: string;
  priority: 'Low' | 'Medium' | 'High';
  notes: string;
}

export function AddManufacturingOrderModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createOrder } = useData();

  const [formData, setFormData] = useState<NewOrderData>({
    finishedProduct: '',
    quantity: 1,
    scheduledStartDate: '',
    dueDate: '',
    assignee: '',
    priority: 'Medium',
    notes: '',
  });

  const assignees = [
    { id: '1', name: 'John Smith', role: 'Production Manager' },
    { id: '2', name: 'Sarah Johnson', role: 'Assembly Supervisor' },
    { id: '3', name: 'Mike Chen', role: 'Quality Inspector' },
    { id: '4', name: 'Lisa Rodriguez', role: 'Production Operator' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.finishedProduct.trim()) {
      setError('Product name is required');
      return;
    }

    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }

    if (!formData.assignee) {
      setError('Please select an assignee');
      return;
    }

    // Check if due date is in the future
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      setError('Due date cannot be in the past');
      return;
    }

    // Check if start date is before due date
    if (formData.scheduledStartDate) {
      const startDate = new Date(formData.scheduledStartDate);
      if (startDate > dueDate) {
        setError('Start date cannot be after due date');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Generate reference number
      const reference = `MO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

      const newOrder = {
        reference,
        finishedProduct: formData.finishedProduct.trim(),
        quantity: formData.quantity,
        scheduledStartDate: formData.scheduledStartDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate,
        assignee: formData.assignee,
        status: 'Draft' as const,
        priority: formData.priority,
        notes: formData.notes.trim(),
        progress: 0,
        components: [],
        workOrders: [],
      };

      await createOrder(newOrder);

      // Reset form and close modal
      setFormData({
        finishedProduct: '',
        quantity: 1,
        scheduledStartDate: '',
        dueDate: '',
        assignee: '',
        priority: 'Medium',
        notes: '',
      });
      setOpen(false);
    } catch (err) {
      setError('Failed to create manufacturing order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      finishedProduct: '',
      quantity: 1,
      scheduledStartDate: '',
      dueDate: '',
      assignee: '',
      priority: 'Medium',
      notes: '',
    });
    setError('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Manufacturing Order
          </DialogTitle>
          <DialogDescription>
            Add a new manufacturing order to the production schedule
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="finishedProduct">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="finishedProduct"
                value={formData.finishedProduct}
                onChange={(e) => setFormData(prev => ({ ...prev, finishedProduct: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'Low' | 'Medium' | 'High') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledStartDate">Scheduled Start Date</Label>
              <Input
                id="scheduledStartDate"
                type="date"
                value={formData.scheduledStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledStartDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assignee">
                Assignee <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.assignee}
                onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an assignee" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      <div className="flex flex-col">
                        <span>{assignee.name}</span>
                        <span className="text-xs text-muted-foreground">{assignee.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes or requirements..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
