'use client';
import type { Serialized } from '@/lib/serialize';

import React, { useState } from 'react';
import { Client, Proposal, ProposalItem } from '@prisma/client';
import { z } from 'zod';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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

import { createProposalSchema, type CreateProposalInput, type UpdateProposalInput } from '../schemas/proposal';
import { createProposalAction, updateProposalAction } from '../actions/proposal-actions';

interface ProposalBuilderProps {
  initialProposal?: Serialized<Proposal & { items: ProposalItem[]; client: Client }>;
  clients: Client[];
  workspaceId: string;
  workspaceSlug: string;
}

type ProposalFormValues = z.input<typeof createProposalSchema>;

const toDateInputValue = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const toCreateProposalInput = (data: ProposalFormValues): CreateProposalInput => ({
  clientId: data.clientId,
  title: data.title,
  description: data.description ?? '',
  currency: data.currency ?? 'USD',
  taxRate: data.taxRate ?? 0,
  expiresAt: new Date(data.expiresAt),
  items: data.items.map((item) => ({
    name: item.name,
    description: item.description ?? '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
});

const toUpdateProposalInput = (data: ProposalFormValues): UpdateProposalInput => ({
  title: data.title,
  description: data.description ?? '',
  currency: data.currency ?? 'USD',
  taxRate: data.taxRate ?? 0,
  expiresAt: new Date(data.expiresAt),
  items: data.items.map((item) => ({
    name: item.name,
    description: item.description ?? '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
});

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

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      clientId: initialProposal?.clientId || clients[0]?.id || '',
      title: initialProposal?.title || '',
      description: initialProposal?.description || '',
      currency: initialProposal?.currency || 'USD',
      taxRate: getInitialTaxRate(),
      expiresAt: initialProposal 
        ? new Date(initialProposal.expiresAt).toISOString().split('T')[0]
        : toDateInputValue(14),
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

  const { control, handleSubmit, formState: { errors } } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Live calculations watch
  const watchItems = useWatch({ control, name: 'items' }) || [];
  const watchTaxRate = useWatch({ control, name: 'taxRate' }) || 0;
  const watchCurrency = useWatch({ control, name: 'currency' }) || 'USD';

  const subtotal = watchItems.reduce((acc: number, item) => {
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

  const onSubmit = async (data: ProposalFormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode) {
        const result = await updateProposalAction(initialProposal.id, workspaceId, toUpdateProposalInput(data));
        if (result.success) {
          toast.success('Proposal updated successfully');
          router.push(`/${workspaceSlug}/proposals/${initialProposal.id}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update proposal');
        }
      } else {
        const result = await createProposalAction(workspaceId, toCreateProposalInput(data));
        if (result.success && result.data) {
          toast.success('Proposal created successfully');
          router.push(`/${workspaceSlug}/proposals/${result.data.id}`);
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to create proposal');
        }
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link href={`/${workspaceSlug}/proposals`}>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Proposals</span>
          </Button>
        </Link>
      </div>

      <div className="border-b border-border pb-5">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {isEditMode ? `Edit Proposal - ${initialProposal.proposalNumber}` : 'New Proposal Draft'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditMode 
            ? 'Modify line items, adjust tax rates, and update scope descriptions.' 
            : 'Structure your service quotation, details, and project outline for review.'}
        </p>
      </div>

      {clients.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-border bg-card rounded-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand/10 text-brand border border-brand/20 mx-auto mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="font-heading text-sm font-bold text-foreground">No clients available</CardTitle>
          <CardDescription className="mt-1 text-xs text-muted-foreground">
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
              <Card className="border border-border rounded-lg overflow-hidden bg-card">
                <CardHeader className="pb-4 border-b border-border bg-muted/30">
                  <CardTitle className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand" />
                    <span>Proposal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">Recipient Client</FormLabel>
                          {isEditMode ? (
                            <div className="h-9 px-3 py-2 border border-border bg-muted/40 rounded-lg text-xs text-muted-foreground font-semibold select-none">
                              {initialProposal.client ? initialProposal.client.companyName : 'Selected Client'}
                            </div>
                          ) : (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-xs h-9 rounded-lg bg-background border-border">
                                  <SelectValue placeholder="Select a client...">
                                    {field.value ? (clients.find(c => c.id === field.value)?.companyName || field.value) : undefined}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-card border border-border text-xs">
                                {clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id}>
                                    {client.companyName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-foreground">Expiry Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="text-xs h-9 rounded-lg bg-background border-border"
                              name={field.name}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              onChange={field.onChange}
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Proposal Subject Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Web Design & Development Scopes" className="text-xs h-9 rounded-lg bg-background border-border" {...field} />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-foreground">Scope Description / Conditions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Introduce the objective, details of services, milestones, and payment conditions..." 
                            className="text-xs min-h-[100px] resize-none rounded-lg bg-background border-border"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Service Line Items */}
              <Card className="border border-border rounded-lg overflow-hidden bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border bg-muted/30">
                  <div>
                    <CardTitle className="font-heading text-sm font-bold text-foreground">Scope & Pricing Items</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Add service line items with cost calculations</CardDescription>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => append({ name: '', description: '', quantity: 1, unitPrice: 0 })}
                    className="cursor-pointer text-xs font-semibold h-8 rounded-lg flex items-center gap-1 bg-background border-border text-foreground"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  {fields.map((field, index) => (
                    <div 
                      key={field.id} 
                      className="p-4 rounded-lg bg-muted/30 border border-border space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <FormField
                          control={control}
                          name={`items.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Service title (e.g. Design Wireframes)" className="text-xs h-9 rounded-lg bg-background border-border" {...field} />
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => remove(index)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg shrink-0 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe details, deliverables or timeline details (optional)..." 
                                className="text-xs h-14 resize-none rounded-lg bg-background border-border"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-[11px]" />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                        <FormField
                          control={control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">Qty</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  className="text-xs h-9 rounded-lg bg-background border-border font-mono tabular-nums"
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  value={field.value} 
                                />
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-muted-foreground">Unit Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-2.5 text-muted-foreground text-xs font-semibold">{currentSymbol}</span>
                                  <Input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    className="pl-7 text-xs h-9 rounded-lg bg-background border-border font-mono tabular-nums"
                                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    value={field.value === 0 ? '' : field.value} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-[11px]" />
                            </FormItem>
                          )}
                        />

                        <div className="flex flex-col justify-end text-right pb-1">
                          <span className="text-xs text-muted-foreground font-medium">Subtotal</span>
                          <span className="text-sm font-bold text-foreground font-mono tabular-nums mt-0.5">
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
                    <p className="text-xs font-medium text-destructive">{errors.items.root.message}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right side: Summary & Settings */}
            <div className="md:col-span-1 space-y-6">
              {/* Invoice Calculations */}
              <Card className="border border-border rounded-lg overflow-hidden bg-card">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                  <CardTitle className="font-heading text-xs font-bold text-muted-foreground">Cost Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-5 text-xs font-medium">
                  {/* Currency settings */}
                  <FormField
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground">Pricing Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-9 rounded-lg bg-background border-border">
                              <SelectValue placeholder="Select currency..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border border-border text-xs">
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="IDR">IDR (Rp)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Tax rate settings */}
                  <FormField
                    control={control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-foreground">Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            max="100"
                            step="0.1"
                            className="text-xs h-9 rounded-lg bg-background border-border font-mono tabular-nums"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value} 
                          />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-semibold text-foreground font-mono tabular-nums">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency, minimumFractionDigits: 0 }).format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax ({watchTaxRate}%)</span>
                      <span className="font-semibold text-foreground font-mono tabular-nums">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency, minimumFractionDigits: 0 }).format(taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-border pt-3.5 font-bold text-foreground text-sm">
                      <span>Total Amount</span>
                      <span className="text-foreground font-mono tabular-nums font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: watchCurrency, minimumFractionDigits: 0 }).format(totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 border-t border-border flex flex-col gap-2">
                  <Button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-1.5 cursor-pointer text-xs h-9 font-semibold">
                    <Save className="h-4 w-4" />
                    <span>{isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save Draft'}</span>
                  </Button>
                  <Link href={`/${workspaceSlug}/proposals`} className="w-full">
                    <Button type="button" variant="outline" className="w-full cursor-pointer text-xs h-9 font-semibold bg-background border-border">
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
