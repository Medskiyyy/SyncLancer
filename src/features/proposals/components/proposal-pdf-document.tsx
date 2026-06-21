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
  proposalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 4,
  },
  proposalMeta: {
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
    color: '#2563eb', // primary blue accent
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
  itemTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#09090b',
  },
  itemDesc: {
    fontSize: 8,
    color: '#71717a',
    marginTop: 2,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  summaryBlock: {
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    borderBottomWidth: 2,
    borderBottomColor: '#27272a',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#71717a',
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#09090b',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb', // primary blue accent
  },
  descriptionBox: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  descriptionText: {
    fontSize: 9,
    color: '#52525b',
    lineHeight: 1.4,
  },
});

interface ProposalPdfDocumentProps {
  proposal: any; // casting is easier than deep typing prisma include
}

export function ProposalPdfDocument({ proposal }: ProposalPdfDocumentProps) {
  const currencyFormatter = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: proposal.currency || 'USD',
    }).format(amount);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.proposalTitle}>PROPOSAL</Text>
            <Text style={styles.proposalMeta}>
              <Text style={styles.metaLabel}>Number: </Text>
              {proposal.proposalNumber}
            </Text>
            <Text style={styles.proposalMeta}>
              <Text style={styles.metaLabel}>Date: </Text>
              {new Date(proposal.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.proposalMeta}>
              <Text style={styles.metaLabel}>Expires: </Text>
              {new Date(proposal.expiresAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.logoContainer}>
            <Text style={styles.logoPlaceholder}>SyncLancer</Text>
            <Text style={[styles.proposalMeta, { textAlign: 'right' }]}>
              Workspace Project Management
            </Text>
          </View>
        </View>

        {/* Details (From & To) */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsBlock}>
            <Text style={styles.detailsTitle}>From</Text>
            <Text style={styles.detailsText}>Independent Freelancer</Text>
            <Text style={styles.detailsText}>SyncLancer Workspace</Text>
          </View>
          <View style={styles.detailsBlock}>
            <Text style={styles.detailsTitle}>Prepared For</Text>
            <Text style={[styles.detailsText, { fontWeight: 'bold' }]}>
              {proposal.client.companyName}
            </Text>
            <Text style={styles.detailsText}>{proposal.client.primaryEmail}</Text>
            <Text style={styles.detailsText}>{proposal.client.phone}</Text>
          </View>
        </View>

        {/* Main Proposal Context Description (if any) */}
        {proposal.description && (
          <View style={styles.descriptionBox}>
            <Text style={styles.detailsTitle}>Proposal Summary & Scope</Text>
            <Text style={styles.descriptionText}>{proposal.description}</Text>
          </View>
        )}

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDescription}>
              <Text style={{ fontWeight: 'bold' }}>Scope Item / Description</Text>
            </View>
            <View style={styles.colQty}>
              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Qty</Text>
            </View>
            <View style={styles.colPrice}>
              <Text style={{ fontWeight: 'bold', textAlign: 'right' }}>Price</Text>
            </View>
            <View style={styles.colTotal}>
              <Text style={{ fontWeight: 'bold', textAlign: 'right' }}>Total</Text>
            </View>
          </View>

          {proposal.items.map((item: any, index: number) => (
            <View key={item.id || index} style={styles.tableRow}>
              <View style={styles.colDescription}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
              </View>
              <View style={styles.colQty}>
                <Text style={{ textAlign: 'center' }}>{item.quantity}</Text>
              </View>
              <View style={styles.colPrice}>
                <Text style={{ textAlign: 'right' }}>{currencyFormatter(Number(item.unitPrice))}</Text>
              </View>
              <View style={styles.colTotal}>
                <Text style={{ textAlign: 'right' }}>{currencyFormatter(Number(item.totalPrice))}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Summary (Subtotal, Tax, Total) */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{currencyFormatter(Number(proposal.subtotal))}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax Amount</Text>
              <Text style={styles.summaryValue}>{currencyFormatter(Number(proposal.taxAmount))}</Text>
            </View>
            <View style={styles.summaryTotalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{currencyFormatter(Number(proposal.totalAmount))}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
