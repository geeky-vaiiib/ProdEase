'use client';

import React, { useState } from 'react';
import { Plus, Package, DollarSign, Hash, AlertCircle } from 'lucide-react';
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

interface NewStockItemData {
  name: string;
  category: string;
  unitCost: number;
  onHand: number;
  unit: string;
  description: string;
  supplier: string;
  minimumStock: number;
}

export function AddStockItemModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<NewStockItemData>({
    name: '',
    category: '',
    unitCost: 0,
    onHand: 0,
    unit: '',
    description: '',
    supplier: '',
    minimumStock: 0,
  });

  const categories = [
    'Raw Materials',
    'Components',
    'Finished Goods',
    'Consumables',
    'Tools & Equipment',
    'Packaging',
    'Safety Equipment',
  ];

  const units = [
    'pcs', 'kg', 'lbs', 'meters', 'feet', 'liters', 'gallons', 'boxes', 'rolls', 'sheets'
  ];

  const suppliers = [
    'ABC Materials Co.',
    'Global Components Ltd.',
    'Premium Supplies Inc.',
    'Industrial Parts Corp.',
    'Quality Materials LLC',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Item name is required');
      return;
    }

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.unit) {
      setError('Please select a unit');
      return;
    }

    if (formData.unitCost < 0) {
      setError('Unit cost cannot be negative');
      return;
    }

    if (formData.onHand < 0) {
      setError('On hand quantity cannot be negative');
      return;
    }

    if (formData.minimumStock < 0) {
      setError('Minimum stock cannot be negative');
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with actual implementation
      const newStockItem = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        category: formData.category,
        unitCost: formData.unitCost,
        onHand: formData.onHand,
        reserved: 0,
        freeToUse: formData.onHand,
        unit: formData.unit,
        description: formData.description.trim(),
        supplier: formData.supplier,
        minimumStock: formData.minimumStock,
        status: formData.onHand > formData.minimumStock ? 'In Stock' : 'Low Stock',
        lastUpdated: new Date().toISOString(),
      };

      // Here you would call your API to create the stock item
      console.log('Creating stock item:', newStockItem);

      // Reset form and close modal
      setFormData({
        name: '',
        category: '',
        unitCost: 0,
        onHand: 0,
        unit: '',
        description: '',
        supplier: '',
        minimumStock: 0,
      });
      setOpen(false);
    } catch (err) {
      setError('Failed to create stock item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      unitCost: 0,
      onHand: 0,
      unit: '',
      description: '',
      supplier: '',
      minimumStock: 0,
    });
    setError('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Stock Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Add New Stock Item
          </DialogTitle>
          <DialogDescription>
            Add a new item to your inventory management system
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
              <Label htmlFor="name">
                Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter item name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">
                Unit <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={(e) => setFormData(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onHand">Current Stock</Label>
              <Input
                id="onHand"
                type="number"
                min="0"
                value={formData.onHand}
                onChange={(e) => setFormData(prev => ({ ...prev, onHand: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumStock">Minimum Stock Level</Label>
              <Input
                id="minimumStock"
                type="number"
                min="0"
                value={formData.minimumStock}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter item description..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
