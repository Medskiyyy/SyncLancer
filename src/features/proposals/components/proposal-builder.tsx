'use client';

import React, { useState, useEffect } from 'react';
import { Client, Proposal, ProposalItem } from '@prisma/client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { createProposalSchema, CreateProposalInput } from '../schemas/proposal';
import { createProposalAction, updateProposalAction } from '../actions/proposal-actions';

interface ProposalBuilderProps {
  initialProposal?: Proposal & { items: ProposalItem[]; client: Client };
  clients: Client[];
  workspaceId: string;
  workspaceSlug: string;
}

export function ProposalBuilder({ 
  initialProposal, 
  clients, 
  workspaceId, 
  workspaceSlug 
}: ProposalBuilderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!initialProposal;

  // Calculate default tax rate from proposal totals if editing
  const getInitialTaxRate = () => {
    if (!initialProposal) return 0;
    const subtotal = Number(initialProposal.subtotal);
    if (subtotal === 0) return 0;
    return (Number(initialProposal.taxAmount) / subtotal) * 100;
  };

  const form = useForm<any>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      clientId: initialProposal?.clientId || clients[0]?.id || '',
      title: initialProposal?.title || '',
      description: initialProposal?.description || '',
      currency: initialProposal?.currency || 'USD',
      taxRate: getInitialTaxRate(),
      expiresAt: initialProposal 
        ? new Date(initialProposal.expiresAt).toISOString().split('T')[0]
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days default
      items: initialProposal
        ? initialProposal.items.map(item => ({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
          }))
        : [{ name: '', description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Live calculations watch
  const watchItems = watch('items') || [];
  const watchTaxRate = watch('taxRate') || 0;
  const watchCurrency = watch('currency') || 'USD';

  const subtotal = watchItems.reduce((acc: number, item: any) => {
    const qty = Number(item?.quantity) || 0;
    const price = Number(item?.unitPrice) || 0;
    return acc + (qty * price);
  }, 0);

  const taxAmount = subtotal * (Number(watchTaxRate) / 100);
  const totalAmount = subtotal + taxAmount;

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    IDR: 'Rp',
  };

  const currentSymbol = currencySymbols[watchCurrency] || watchCurrency;

  const onSubmit = async (data: CreateProposalInput) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        const result = await updateProposalAction(initialProposal.id, workspaceId, data as any);
        if (result.success) {
          toast.success('Proposal updated successfully');
          router.push(`/${workspaceSlug}/proposals/${initialProposal.id}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update proposal');
        }
      } else {
        const result = await createProposalAction(workspaceId, data);
        if (result.success && result.data) {
          toast.success('Proposal created successfully');
          router.push(`/${workspaceSlug}/proposals/${result.data.id}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to create proposal');
        }
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <Link href={`/${workspaceSlug}/proposals`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Proposals</span>
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {isEditMode ? `Edit Proposal — ${initialProposal.proposalNumber}` : 'New Proposal'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditMode 
            ? 'Modify line items and adjust tax rates for this draft proposal.' 
            : 'Fill in details below to structure a cost quotation and service agreement.'}
        </p>
      </div>

      {clients.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-yellow-600 mx-auto mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">No clients available</CardTitle>
          <CardDescription className="mt-1">
            You must create at least one client before you can draft a proposal.
          </CardDescription>
          <Link href={`/${workspaceSlug}/clients`} className="mt-4 inline-block">
            <Button>Go to Clients</Button>
          </Link>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-3">
            {/* Left side: Form Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Proposal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={control as any}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client</FormLabel>
                          {isEditMode ? (
                            <div className="h-9 px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-md text-sm text-zinc-500 font-medium select-none dark:bg-zinc-800 dark:border-zinc-700">
                              {initialProposal.client ? (initialProposal as any).client.companyName : 'Selected Client'}
                            </div>
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.companyName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control as any}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control as any}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposal Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., E-commerce Website Design & Development" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview / Scope Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detail the scope of services, objectives, and conditions of this agreement..." 
                            className="h-28 resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Service Line Items */}
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-bold">Scope & Pricing Items</CardTitle>
                    <CardDescription>Detail service line items and corresponding pricing</CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => append({ name: '', description: '', quantity: 1, unitPrice: 0 })}
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="p-4 rounded-lg bg-zinc-50 border border-zinc-100 dark:bg-zinc-900/30 dark:border-zinc-800 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <FormField
                          control={control as any}
                          name={`items.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Service name (e.g. Frontend React Development)" className="bg-white dark:bg-zinc-900" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => remove(index)}
                            className="h-9 w-9 text-zinc-400 hover:text-red-600 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={control as any}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Service description details (optional)..." 
                                className="h-14 resize-none bg-white dark:bg-zinc-900"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 grid-cols-3">
                        <FormField
                          control={control as any}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Qty</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  className="bg-white dark:bg-zinc-900"
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  value={field.value} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control as any}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Unit Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-2 text-zinc-400 text-xs">{currentSymbol}</span>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    className="pl-6 bg-white dark:bg-zinc-900"
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    value={field.value} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex flex-col justify-end text-right pb-2">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Total</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: watchCurrency,
                            }).format((Number(watchItems[index]?.quantity) || 0) * (Number(watchItems[index]?.unitPrice) || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {errors.items?.root && (
                    <p className="text-sm font-medium text-destructive">{(errors.items.root as any).message}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right side: Summary & Settings */}
            <div className="md:col-span-1 space-y-6">
              {/* Invoice Calculations */}
              <Card className="shadow-sm border-2 border-primary/10">
                <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 pb-4 border-b">
                  <CardTitle className="text-sm font-bold text-zinc-500 uppercase">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 text-sm">
                  {/* Currency settings */}
                  <FormField
                    control={control as any}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="IDR">IDR (Rp)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tax rate settings */}
                  <FormField
                    control={control as any}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            max="100"
                            step="0.1"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency }).format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Tax ({watchTaxRate}%)</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency }).format(taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-dashed pt-2 font-bold text-zinc-900 dark:text-zinc-50 text-base">
                      <span>Total</span>
                      <span className="text-primary">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency }).format(totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-t flex flex-col gap-2">
                  <Button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-1.5">
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Draft'}</span>
                  </Button>
                  <Link href={`/${workspaceSlug}/proposals`} className="w-full">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
