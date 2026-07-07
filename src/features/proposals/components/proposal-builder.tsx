'use client';

import React, { useState } from 'react';
import { Client, Proposal, ProposalItem } from '@prisma/client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Save, AlertCircle, FileText, PlusCircle } from 'lucide-react';
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
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-300">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link href={`/${workspaceSlug}/proposals`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Proposals</span>
          </Button>
        </Link>
      </div>

      <div className="border-b border-zinc-200/60 dark:border-zinc-800/80 pb-5">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-55">
          {isEditMode ? `Edit Proposal — ${initialProposal.proposalNumber}` : 'New Proposal Draft'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isEditMode 
            ? 'Modify line items, adjust tax rates, and update scope descriptions.' 
            : 'Structure your service quotation, details, and project outline for review.'}
        </p>
      </div>

      {clients.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/15 mx-auto mb-4 animate-bounce">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No clients available</CardTitle>
          <CardDescription className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            You must create at least one active client before you can draft a proposal.
          </CardDescription>
          <Link href={`/${workspaceSlug}/clients`} className="mt-4 inline-block">
            <Button className="cursor-pointer text-xs font-semibold h-9">Go to Clients</Button>
          </Link>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-3">
            {/* Left side: Form Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <CardHeader className="pb-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Proposal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={control as any}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Recipient Client</FormLabel>
                          {isEditMode ? (
                            <div className="h-9 px-3 py-2 border border-zinc-200 bg-zinc-50 rounded-lg text-xs text-zinc-500 font-semibold select-none dark:bg-zinc-950 dark:border-zinc-800/80">
                              {initialProposal.client ? (initialProposal as any).client.companyName : 'Selected Client'}
                            </div>
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-xs h-9 rounded-lg bg-white dark:bg-zinc-900">
                                  <SelectValue placeholder="Select a client...">
                                    {field.value ? (clients.find(c => c.id === field.value)?.companyName || field.value) : undefined}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.companyName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control as any}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" className="text-xs h-9 rounded-lg bg-white dark:bg-zinc-900" {...field} />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control as any}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Proposal Subject Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Web Design & Development Scopes" className="text-xs h-9 rounded-lg bg-white dark:bg-zinc-900" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Scope Description / Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Introduce the objective, details of services, milestones, and payment conditions..." 
                            className="text-xs min-h-[100px] resize-none rounded-lg bg-white dark:bg-zinc-900"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Service Line Items */}
              <Card className="shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div>
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Scope & Pricing Items</CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500 dark:text-zinc-400">Add service line items with cost calculations</CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => append({ name: '', description: '', quantity: 1, unitPrice: 0 })}
                    className="cursor-pointer text-[10px] font-bold h-8 rounded-lg flex items-center gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  {fields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="p-4 rounded-xl bg-zinc-50/50 border border-zinc-200/60 dark:bg-zinc-950/20 dark:border-zinc-800/80 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <FormField
                          control={control as any}
                          name={`items.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Service title (e.g. Design Wireframes)" className="text-xs h-9 rounded-lg bg-white dark:bg-zinc-900" {...field} />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => remove(index)}
                            className="h-9 w-9 text-zinc-400 hover:text-destructive hover:bg-destructive/5 rounded-lg shrink-0 cursor-pointer"
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
                                placeholder="Describe details, deliverables or timeline details (optional)..." 
                                className="text-xs h-14 resize-none rounded-lg bg-white dark:bg-zinc-900"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 grid-cols-3">
                        <FormField
                          control={control as any}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Qty</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  className="text-xs h-9 rounded-lg bg-white dark:bg-zinc-900"
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  value={field.value} 
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control as any}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Unit Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-2.5 text-zinc-400 text-xs font-semibold">{currentSymbol}</span>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    className="pl-7 text-xs h-9 rounded-lg bg-white dark:bg-zinc-900"
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    value={field.value === 0 ? '' : field.value} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />

                        <div className="flex flex-col justify-end text-right pb-1">
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider">Subtotal</span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-0.5">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: watchCurrency,
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format((Number(watchItems[index]?.quantity) || 0) * (Number(watchItems[index]?.unitPrice) || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {errors.items?.root && (
                    <p className="text-xs font-medium text-destructive">{(errors.items.root as any).message}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right side: Summary & Settings */}
            <div className="md:col-span-1 space-y-6">
              {/* Invoice Calculations */}
              <Card className="shadow-xs border border-border rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50 pb-4 border-b border-zinc-150 dark:border-zinc-800">
                  <CardTitle className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5 text-xs font-semibold">
                  {/* Currency settings */}
                  <FormField
                    control={control as any}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-zinc-700 dark:text-zinc-350">Pricing Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-9 rounded-lg bg-white dark:bg-zinc-950">
                              <SelectValue placeholder="Select currency..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="IDR">IDR (Rp)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  {/* Tax rate settings */}
                  <FormField
                    control={control as any}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-zinc-700 dark:text-zinc-350">Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            max="100"
                            step="0.1"
                            className="text-xs h-9 rounded-lg bg-white dark:bg-zinc-950"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value} 
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-2 font-medium">
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-450">
                      <span>Subtotal</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency, minimumFractionDigits: 0 }).format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-450">
                      <span>Tax ({watchTaxRate}%)</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency, minimumFractionDigits: 0 }).format(taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-zinc-200 dark:border-zinc-700/80 pt-3.5 font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                      <span>Total Amount</span>
                      <span className="text-primary font-mono font-black">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency, minimumFractionDigits: 0 }).format(totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/50 p-4 border-t border-zinc-150 dark:border-zinc-800 flex flex-col gap-2">
                  <Button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-1.5 cursor-pointer text-xs h-9 font-semibold">
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Draft'}</span>
                  </Button>
                  <Link href={`/${workspaceSlug}/proposals`} className="w-full">
                    <Button type="button" variant="outline" className="w-full cursor-pointer text-xs h-9 font-semibold bg-white dark:bg-zinc-950">
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
