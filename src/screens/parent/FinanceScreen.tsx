import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { parentApi } from '../../api/parentApi';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorView,
  Loader,
  Screen,
  SectionHeader,
} from '../../components/ui';
import { colors, radius, spacing, typography } from '../../theme';
import type { ParentInvoice, ParentPayment } from '../../types/parent';
import { downloadAndShare } from '../../utils/download';
import { formatCurrency, formatDate } from '../../utils/format';
import { invoiceStatusTone } from '../../utils/status';

type Tab = 'invoices' | 'payments';
type InvoiceFilter = 'all' | 'unpaid' | 'overdue' | 'paid';
type PaymentFilter = 'all' | string;

export function FinanceScreen() {
  const [tab, setTab] = useState<Tab>('invoices');

  const invoicesQuery = useQuery({
    queryKey: ['parent', 'invoices'],
    queryFn: parentApi.getAllInvoices,
    enabled: tab === 'invoices',
  });

  const paymentsQuery = useQuery({
    queryKey: ['parent', 'payments'],
    queryFn: parentApi.getAllPayments,
    enabled: tab === 'payments',
  });

  const active = tab === 'invoices' ? invoicesQuery : paymentsQuery;

  return (
    <Screen refreshing={active.isRefetching} onRefresh={active.refetch}>
      <View style={styles.tabs}>
        <TabButton active={tab === 'invoices'} onPress={() => setTab('invoices')} label="Factures" />
        <TabButton active={tab === 'payments'} onPress={() => setTab('payments')} label="Paiements" />
      </View>

      {tab === 'invoices' ? (
        <InvoicesTab
          data={invoicesQuery.data}
          isLoading={invoicesQuery.isLoading}
          isError={invoicesQuery.isError}
          error={invoicesQuery.error as Error | null}
          onRetry={invoicesQuery.refetch}
        />
      ) : (
        <PaymentsTab
          data={paymentsQuery.data}
          isLoading={paymentsQuery.isLoading}
          isError={paymentsQuery.isError}
          error={paymentsQuery.error as Error | null}
          onRetry={paymentsQuery.refetch}
        />
      )}
    </Screen>
  );
}

function TabButton({
  active,
  onPress,
  label,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Text
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      {label}
    </Text>
  );
}

function FilterChip({
  active,
  label,
  count,
  onPress,
  tone,
}: {
  active: boolean;
  label: string;
  count?: number;
  onPress: () => void;
  tone?: 'danger' | 'warning' | 'success';
}) {
  const activeColor =
    tone === 'danger'
      ? colors.danger
      : tone === 'warning'
      ? colors.warning
      : tone === 'success'
      ? colors.success
      : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: activeColor, borderColor: activeColor },
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
        {typeof count === 'number' ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}

function InvoicesTab({
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  data?: ParentInvoice[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  const [filter, setFilter] = useState<InvoiceFilter>('all');

  const stats = useMemo(() => {
    if (!data) return { total: 0, paid: 0, due: 0, unpaid: 0, overdue: 0, paidCount: 0 };
    return data.reduce(
      (acc, inv) => {
        acc.total += inv.totalAmount ?? 0;
        acc.paid += inv.paidAmount ?? 0;
        acc.due += inv.remainingAmount ?? 0;
        if (inv.isOverdue) acc.overdue += 1;
        const status = (inv.status ?? '').toUpperCase();
        if (status === 'PAID') acc.paidCount += 1;
        else acc.unpaid += 1;
        return acc;
      },
      { total: 0, paid: 0, due: 0, unpaid: 0, overdue: 0, paidCount: 0 }
    );
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((inv) => {
      const status = (inv.status ?? '').toUpperCase();
      switch (filter) {
        case 'unpaid':
          return status !== 'PAID';
        case 'overdue':
          return inv.isOverdue;
        case 'paid':
          return status === 'PAID';
        default:
          return true;
      }
    });
  }, [data, filter]);

  if (isLoading) return <Loader label="Chargement des factures…" />;
  if (isError) return <ErrorView message={error?.message} onRetry={onRetry} />;
  if (!data || data.length === 0) {
    return <EmptyState title="Aucune facture" description="Aucune facture n'a été émise." />;
  }

  return (
    <>
      <Card style={styles.kpiCard}>
        <View style={styles.kpiRow}>
          <KpiBlock label="Total facturé" value={formatCurrency(stats.total)} />
          <View style={styles.kpiDivider} />
          <KpiBlock label="Total payé" value={formatCurrency(stats.paid)} color={colors.success} />
          <View style={styles.kpiDivider} />
          <KpiBlock
            label="Solde dû"
            value={formatCurrency(stats.due)}
            color={stats.due > 0 ? colors.warning : colors.textSecondary}
          />
        </View>
      </Card>

      <View style={styles.chipsRow}>
        <FilterChip
          active={filter === 'all'}
          label="Toutes"
          count={data.length}
          onPress={() => setFilter('all')}
        />
        <FilterChip
          active={filter === 'unpaid'}
          label="Impayées"
          count={stats.unpaid}
          tone="warning"
          onPress={() => setFilter('unpaid')}
        />
        <FilterChip
          active={filter === 'overdue'}
          label="En retard"
          count={stats.overdue}
          tone="danger"
          onPress={() => setFilter('overdue')}
        />
        <FilterChip
          active={filter === 'paid'}
          label="Payées"
          count={stats.paidCount}
          tone="success"
          onPress={() => setFilter('paid')}
        />
      </View>

      <SectionHeader title={`${filtered.length} facture${filtered.length > 1 ? 's' : ''}`} />
      {filtered.length === 0 ? (
        <EmptyState
          title="Aucune facture"
          description="Aucune facture ne correspond à ce filtre."
        />
      ) : (
        filtered.map((inv) => <InvoiceCard key={inv.id} invoice={inv} />)
      )}
    </>
  );
}

function KpiBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.kpiBlock}>
      <Text style={styles.kpiLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.kpiValue, color && { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ProgressBar({ percent, danger }: { percent: number; danger?: boolean }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color = danger ? colors.danger : clamped >= 100 ? colors.success : colors.primary;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

function InvoiceCard({ invoice }: { invoice: ParentInvoice }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndShare(
        `/parent/invoices/${invoice.id}/pdf`,
        `facture-${invoice.invoiceNumber}.pdf`
      );
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Échec du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const total = invoice.totalAmount ?? 0;
  const paid = invoice.paidAmount ?? 0;
  const percent = total > 0 ? (paid / total) * 100 : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.rowHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          <Text style={styles.student}>
            {invoice.studentFullName}
            {invoice.studentClass ? ` • ${invoice.studentClass}` : ''}
          </Text>
        </View>
        <Badge
          label={invoice.statusLabel ?? invoice.status}
          tone={invoice.isOverdue ? 'danger' : invoiceStatusTone(invoice.status)}
        />
      </View>

      <View style={styles.amountRow}>
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(invoice.totalAmount, invoice.currency)}
          </Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Payé</Text>
          <Text style={[styles.amountValue, { color: colors.success }]}>
            {formatCurrency(paid, invoice.currency)}
          </Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.amountLabel}>Restant</Text>
          <Text
            style={[
              styles.amountValue,
              { color: invoice.remainingAmount > 0 ? colors.warning : colors.textSecondary },
            ]}
          >
            {formatCurrency(invoice.remainingAmount, invoice.currency)}
          </Text>
        </View>
      </View>

      <ProgressBar percent={percent} danger={invoice.isOverdue && percent < 100} />
      <Text style={styles.progressLabel}>{Math.round(percent)}% payé</Text>

      <Text style={styles.meta}>
        Émise le {formatDate(invoice.issueDate)} • Échéance {formatDate(invoice.dueDate)}
        {invoice.isOverdue ? ` • ${invoice.daysOverdue}j de retard` : ''}
      </Text>

      {invoice.notes ? (
        <View style={styles.notesBox}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.notesText} numberOfLines={3}>
            {invoice.notes}
          </Text>
        </View>
      ) : null}

      {invoice.canDownload ? (
        <Button
          label="Télécharger le PDF"
          variant="secondary"
          size="sm"
          loading={downloading}
          onPress={handleDownload}
          icon={<Ionicons name="download-outline" size={16} color={colors.text} />}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </Card>
  );
}

function PaymentsTab({
  data,
  isLoading,
  isError,
  error,
  onRetry,
}: {
  data?: ParentPayment[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  const [filter, setFilter] = useState<PaymentFilter>('all');

  const stats = useMemo(() => {
    if (!data) return { total: 0, count: 0, methods: new Map<string, { label: string; count: number }>() };
    const methods = new Map<string, { label: string; count: number }>();
    let total = 0;
    for (const p of data) {
      total += p.amount ?? 0;
      const key = (p.paymentMethod ?? 'OTHER').toUpperCase();
      const existing = methods.get(key);
      if (existing) existing.count += 1;
      else methods.set(key, { label: p.paymentMethodLabel ?? key, count: 1 });
    }
    return { total, count: data.length, methods };
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data;
    return data.filter((p) => (p.paymentMethod ?? 'OTHER').toUpperCase() === filter);
  }, [data, filter]);

  if (isLoading) return <Loader label="Chargement des paiements…" />;
  if (isError) return <ErrorView message={error?.message} onRetry={onRetry} />;
  if (!data || data.length === 0) {
    return <EmptyState title="Aucun paiement" description="Aucun paiement n'a été enregistré." />;
  }

  return (
    <>
      <Card style={styles.kpiCard}>
        <View style={styles.kpiRow}>
          <KpiBlock label="Total payé" value={formatCurrency(stats.total)} color={colors.success} />
          <View style={styles.kpiDivider} />
          <KpiBlock label="Paiements" value={String(stats.count)} />
        </View>
      </Card>

      <View style={styles.chipsRow}>
        <FilterChip
          active={filter === 'all'}
          label="Tous"
          count={data.length}
          onPress={() => setFilter('all')}
        />
        {Array.from(stats.methods.entries()).map(([key, { label, count }]) => (
          <FilterChip
            key={key}
            active={filter === key}
            label={label}
            count={count}
            onPress={() => setFilter(key)}
          />
        ))}
      </View>

      <SectionHeader title={`${filtered.length} paiement${filtered.length > 1 ? 's' : ''}`} />
      {filtered.length === 0 ? (
        <EmptyState
          title="Aucun paiement"
          description="Aucun paiement ne correspond à ce filtre."
        />
      ) : (
        filtered.map((p) => <PaymentCard key={p.id} payment={p} />)
      )}
    </>
  );
}

function PaymentCard({ payment }: { payment: ParentPayment }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndShare(
        `/parent/payments/${payment.id}/receipt/pdf`,
        `recu-${payment.paymentNumber ?? payment.id}.pdf`
      );
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Échec du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const statusTone = paymentStatusTone(payment.status);

  return (
    <Card style={styles.card}>
      <View style={styles.rowHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.invoiceNumber}>
            {payment.paymentNumber ?? `#${payment.id}`}
          </Text>
          {payment.invoiceNumber ? (
            <Text style={styles.student}>Facture {payment.invoiceNumber}</Text>
          ) : null}
          {payment.studentFullName ? (
            <Text style={styles.meta}>{payment.studentFullName}</Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.paymentAmount}>
            {formatCurrency(payment.amount, payment.currency)}
          </Text>
          {payment.statusLabel ? (
            <View style={{ marginTop: spacing.xs }}>
              <Badge label={payment.statusLabel} tone={statusTone} />
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.meta}>
        {formatDate(payment.paymentDate)}
        {payment.paymentMethodLabel ? ` • ${payment.paymentMethodLabel}` : ''}
        {payment.reference ? ` • Réf. ${payment.reference}` : ''}
      </Text>

      {payment.notes ? (
        <View style={styles.notesBox}>
          <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.notesText} numberOfLines={3}>
            {payment.notes}
          </Text>
        </View>
      ) : null}

      <Button
        label="Télécharger le reçu"
        variant="secondary"
        size="sm"
        loading={downloading}
        onPress={handleDownload}
        icon={<Ionicons name="download-outline" size={16} color={colors.text} />}
        style={{ marginTop: spacing.md }}
      />
    </Card>
  );
}

function paymentStatusTone(
  status?: string
): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  switch ((status ?? '').toUpperCase()) {
    case 'COMPLETED':
    case 'VALIDATED':
    case 'CONFIRMED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
    case 'REJECTED':
      return 'danger';
    case 'CANCELLED':
      return 'neutral';
    default:
      return 'info';
  }
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.md,
    ...typography.bodyBold,
    color: colors.textSecondary,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  tabActive: {
    backgroundColor: colors.surface,
    color: colors.text,
  },
  kpiCard: { marginBottom: spacing.md, padding: spacing.md },
  kpiRow: { flexDirection: 'row', alignItems: 'center' },
  kpiBlock: { flex: 1, alignItems: 'center' },
  kpiDivider: { width: 1, height: 32, backgroundColor: colors.border },
  kpiLabel: { ...typography.small, color: colors.textMuted, textTransform: 'uppercase' },
  kpiValue: { ...typography.bodyBold, color: colors.text, marginTop: spacing.xs },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipPressed: { opacity: 0.7 },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  card: { marginBottom: spacing.sm },
  rowHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  invoiceNumber: { ...typography.bodyBold, color: colors.text },
  student: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  paymentAmount: { ...typography.h3, color: colors.success },
  amountRow: { flexDirection: 'row', marginBottom: spacing.sm },
  amountCol: { flex: 1 },
  amountLabel: { ...typography.small, color: colors.textMuted, textTransform: 'uppercase' },
  amountValue: { ...typography.bodyBold, color: colors.text, marginTop: 2 },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  meta: { ...typography.small, color: colors.textSecondary, marginTop: spacing.xs },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
  notesText: { ...typography.small, color: colors.textSecondary, flex: 1, lineHeight: 16 },
});
