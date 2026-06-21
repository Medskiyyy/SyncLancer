import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#18181b', // zinc-900
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7', // zinc-200
    paddingBottom: 20,
    marginBottom: 30,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 4,
  },
  invoiceMeta: {
    fontSize: 9,
    color: '#71717a', // zinc-500
    marginTop: 2,
  },
  metaLabel: {
    color: '#27272a', // zinc-800
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'flex-end',
  },
  logoPlaceholder: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981', // emerald-500
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailsBlock: {
    width: '45%',
  },
  detailsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#71717a', // zinc-500
    textTransform: 'uppercase',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
    paddingBottom: 2,
  },
  detailsText: {
    fontSize: 9,
    color: '#27272a',
    lineHeight: 1.4,
  },
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    backgroundColor: '#fafafa',
    padding: 6,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    padding: 6,
    alignItems: 'center',
  },
  colDescription: {
    width: '50%',
  },
  colQty: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colTotal: {
    width: '20%',
    textAlign: 'right',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryBlock: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    color: '#71717a',
    fontSize: 9,
  },
  summaryValue: {
    color: '#27272a',
    fontWeight: 'bold',
    fontSize: 9,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingTop: 6,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981', // emerald-600
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#a1a1aa',
  },
});

interface InvoicePdfProps {
  invoice: any;
}

export function InvoicePdfDocument({ invoice }: InvoicePdfProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(num);
  };

  const subtotal = Number(invoice.subtotal);
  const taxAmount = Number(invoice.taxAmount);
  const totalAmount = Number(invoice.totalAmount);
  const taxRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>
              Number: <Text style={styles.metaLabel}>{invoice.invoiceNumber}</Text>
            </Text>
            <Text style={styles.invoiceMeta}>
              Date: <Text style={styles.metaLabel}>{formatDate(invoice.createdAt)}</Text>
            </Text>
            <Text style={styles.invoiceMeta}>
              Due Date: <Text style={styles.metaLabel}>{formatDate(invoice.dueDate)}</Text>
            </Text>
          </View>
          <View style={styles.logoContainer}>
            <Text style={styles.logoPlaceholder}>SyncLancer</Text>
            <Text style={[styles.invoiceMeta, { marginTop: 5 }]}>Status: {invoice.status}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsBlock}>
            <Text style={styles.detailsTitle}>Billed From</Text>
            <Text style={styles.detailsText}>Freelancer Dashboard Member</Text>
            {invoice.project && (
              <Text style={[styles.detailsText, { marginTop: 4, color: '#71717a' }]}>
                Project: {invoice.project.name}
              </Text>
            )}
          </View>
          <View style={styles.detailsBlock}>
            <Text style={styles.detailsTitle}>Billed To</Text>
            <Text style={[styles.detailsText, { fontWeight: 'bold' }]}>
              {invoice.client.companyName}
            </Text>
            <Text style={styles.detailsText}>{invoice.client.primaryEmail}</Text>
            {invoice.client.phone && <Text style={styles.detailsText}>{invoice.client.phone}</Text>}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, { fontWeight: 'bold' }]}>Description</Text>
            <Text style={[styles.colQty, { fontWeight: 'bold' }]}>Qty</Text>
            <Text style={[styles.colPrice, { fontWeight: 'bold' }]}>Unit Price</Text>
            <Text style={[styles.colTotal, { fontWeight: 'bold' }]}>Amount</Text>
          </View>

          {invoice.items?.map((item: any) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={{ fontWeight: 'bold', fontSize: 9.5 }}>{item.name}</Text>
                {item.description ? (
                  <Text style={{ color: '#71717a', fontSize: 8.5, marginTop: 2 }}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.totalPrice)}</Text>
            </View>
          ))}
        </View>

        {/* Summary Block */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({taxRate.toFixed(1)}%)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(taxAmount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business. Generated by SyncLancer.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
