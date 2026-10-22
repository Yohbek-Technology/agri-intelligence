'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useCatalogPage, type CatalogTab as Tab } from '@/hooks/useCatalog'
import { DataTable } from '@/components/ui/dataTable'
import { TableSkeleton } from '@/components/ui/skeleton'
import type { ColumnDef } from '@tanstack/react-table'
import type {
  CropRow,
  VarietyRow,
  FertilizerRateRow,
  PestRow,
  ChemicalRow,
  CatalogStatus,
} from '@repo/shared'

const UI_BORDER = '2px solid var(--color-border-ui)'

function StatusBadge({ status }: { status: CatalogStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
        status === 'active' ? 'bg-success-light text-success' : 'bg-surface-subtle text-text-faint'
      }`}
    >
      {status}
    </span>
  )
}

export default function CatalogPage() {
  const t = useTranslations('OfficerPages')

  const {
    activeTab,
    setActiveTab,
    selectedCropId,
    setSelectedCropId,
    retireTarget,
    setRetireTarget,
    cropList,
    varietyList,
    rateList,
    pestList,
    chemicalList,
    handleRetire,
    isLoading,
    isRetiring,
  } = useCatalogPage()

  const TABS: { id: Tab; label: string }[] = [
    { id: 'crops',      label: t('catalog_tab_crops') },
    { id: 'varieties',  label: t('catalog_tab_varieties') },
    { id: 'fertilizer', label: t('catalog_tab_fertilizer') },
    { id: 'pests',      label: t('catalog_tab_pests') },
    { id: 'chemicals',  label: t('catalog_tab_chemicals') },
  ]

  /* ── Column definitions ─────────────────────────────────────────────── */

  const cropColumns: ColumnDef<CropRow, unknown>[] = [
    {
      accessorKey: 'code',
      header: () => t('catalog_col_code'),
      cell: ({ row }) => <span className="font-mono text-xs text-text-muted">{row.original.code}</span>,
      size: 100,
    },
    {
      accessorKey: 'nameEn',
      header: () => t('catalog_col_name_en'),
      cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.nameEn}</span>,
      size: 200,
    },
    {
      accessorKey: 'maxPlausibleYieldQtPerHa',
      header: () => t('catalog_col_max_yield'),
      cell: ({ row }) => <span className="text-text-muted">{row.original.maxPlausibleYieldQtPerHa}</span>,
      size: 150,
    },
    {
      id: 'status',
      header: () => t('catalog_col_status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 120,
    },
  ]

  const varietyColumns: ColumnDef<VarietyRow, unknown>[] = [
    {
      accessorKey: 'name',
      header: () => t('catalog_col_name_en'),
      cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.name}</span>,
      size: 200,
    },
    {
      id: 'certified',
      header: () => t('catalog_col_certified'),
      cell: ({ row }) => (
        <span className={`text-xs font-medium whitespace-nowrap ${row.original.isCertified ? 'text-success' : 'text-text-faint'}`}>
          {row.original.isCertified ? t('catalog_certified') : t('catalog_local')}
        </span>
      ),
      size: 110,
    },
    {
      id: 'zones',
      header: () => t('catalog_col_zones'),
      cell: ({ row }) => (
        <span className="text-text-muted text-xs whitespace-nowrap">
          {row.original.permittedZones.join(', ')}
        </span>
      ),
      size: 150,
    },
    {
      id: 'status',
      header: () => t('catalog_col_status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 120,
    },
  ]

  const rateColumns: ColumnDef<FertilizerRateRow, unknown>[] = [
    {
      id: 'crop',
      header: () => t('catalog_col_crop'),
      cell: ({ row }) => {
        const name = cropList.find((c) => c.id === row.original.cropId)?.nameEn ?? row.original.cropId
        return <span className="text-text-primary whitespace-nowrap">{name}</span>
      },
      size: 160,
    },
    {
      accessorKey: 'agroZone',
      header: () => t('catalog_col_zone'),
      cell: ({ row }) => (
        <span className="text-text-muted capitalize whitespace-nowrap">
          {row.original.agroZone.replace('_', ' ')}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'ureaKgPerHa',
      header: () => t('catalog_col_urea'),
      cell: ({ row }) => <span className="font-mono text-text-primary">{row.original.ureaKgPerHa}</span>,
      size: 120,
    },
    {
      accessorKey: 'npsKgPerHa',
      header: () => t('catalog_col_nps'),
      cell: ({ row }) => <span className="font-mono text-text-primary">{row.original.npsKgPerHa}</span>,
      size: 120,
    },
    {
      accessorKey: 'seedKgPerHa',
      header: () => t('catalog_col_seed'),
      cell: ({ row }) => <span className="font-mono text-text-primary">{row.original.seedKgPerHa}</span>,
      size: 120,
    },
    {
      accessorKey: 'effectiveFrom',
      header: () => t('catalog_col_effective'),
      cell: ({ row }) => <span className="text-text-muted whitespace-nowrap">{row.original.effectiveFrom}</span>,
      size: 130,
    },
    {
      accessorKey: 'ratesVersion',
      header: () => t('catalog_col_version'),
      cell: ({ row }) => <span className="font-mono text-text-faint text-xs">v{row.original.ratesVersion}</span>,
      size: 90,
    },
  ]

  const pestColumns: ColumnDef<PestRow, unknown>[] = [
    {
      accessorKey: 'code',
      header: () => t('catalog_col_code'),
      cell: ({ row }) => <span className="font-mono text-xs text-text-muted">{row.original.code}</span>,
      size: 120,
    },
    {
      id: 'name',
      header: () => t('catalog_col_name_en'),
      cell: ({ row }) => {
        const name = typeof row.original.name === 'object' && row.original.name !== null
          ? (row.original.name as Record<string, string>).en ?? ''
          : String(row.original.name)
        return <span className="font-medium text-text-primary">{name}</span>
      },
      size: 200,
    },
    {
      accessorKey: 'kind',
      header: () => t('catalog_col_kind'),
      cell: ({ row }) => <span className="capitalize text-text-muted whitespace-nowrap">{row.original.kind}</span>,
      size: 100,
    },
    {
      id: 'quarantine',
      header: () => t('catalog_col_quarantine'),
      cell: ({ row }) =>
        row.original.isQuarantinePest ? (
          <span className="text-xs font-medium text-danger whitespace-nowrap">
            {t('catalog_quarantine_badge')}
          </span>
        ) : null,
      size: 110,
    },
    {
      id: 'status',
      header: () => t('catalog_col_status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 110,
    },
  ]

  const chemicalColumns: ColumnDef<ChemicalRow, unknown>[] = [
    {
      accessorKey: 'brandName',
      header: () => t('catalog_col_brand'),
      cell: ({ row }) => <span className="font-medium text-text-primary whitespace-nowrap">{row.original.brandName}</span>,
      size: 200,
    },
    {
      accessorKey: 'activeIngredient',
      header: () => t('catalog_col_ingredient'),
      cell: ({ row }) => <span className="text-text-muted text-xs whitespace-nowrap">{row.original.activeIngredient}</span>,
      size: 220,
    },
    {
      accessorKey: 'category',
      header: () => t('catalog_col_category'),
      cell: ({ row }) => <span className="capitalize text-text-muted whitespace-nowrap">{row.original.category}</span>,
      size: 120,
    },
    {
      accessorKey: 'safetyIntervalDays',
      header: () => t('catalog_col_phi'),
      cell: ({ row }) => <span className="font-mono text-text-muted whitespace-nowrap">{row.original.safetyIntervalDays}d</span>,
      size: 90,
    },
    {
      id: 'status',
      header: () => t('catalog_col_status'),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 110,
    },
    {
      id: 'actions',
      header: () => '',
      enableSorting: false,
      size: 90,
      cell: ({ row }) =>
        row.original.status === 'active' ? (
          <button
            type="button"
            onClick={() => setRetireTarget(row.original.id)}
            className="text-xs font-medium text-danger hover:underline cursor-pointer whitespace-nowrap"
          >
            {t('catalog_retire')}
          </button>
        ) : null,
    },
  ]



  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">{t('catalog_title')}</h1>
        <p className="text-sm text-text-muted mt-1">{t('catalog_subtitle')}</p>
      </motion.div>

      {/* Tab bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.06 }}
        className="flex gap-1 overflow-x-auto"
        style={{ borderBottom: UI_BORDER }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Varieties crop filter */}
      <AnimatePresence>
        {activeTab === 'varieties' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <label className="text-sm font-medium text-text-primary whitespace-nowrap">
              {t('catalog_filter_crop')}
            </label>
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="text-sm rounded-lg px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              style={{ border: UI_BORDER }}
            >
              <option value="">{t('catalog_all_crops')}</option>
              {cropList.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table — animated tab switch */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <TableSkeleton rows={7} cols={5} />
          ) : activeTab === 'crops' ? (
            <DataTable<CropRow>
              columns={cropColumns}
              data={cropList}
              emptyMessage={t('catalog_no_crops')}
            />
          ) : activeTab === 'varieties' ? (
            <DataTable<VarietyRow>
              columns={varietyColumns}
              data={varietyList}
              emptyMessage={t('catalog_no_varieties')}
            />
          ) : activeTab === 'fertilizer' ? (
            <DataTable<FertilizerRateRow>
              columns={rateColumns}
              data={rateList}
              emptyMessage={t('catalog_no_rates')}
            />
          ) : activeTab === 'pests' ? (
            <DataTable<PestRow>
              columns={pestColumns}
              data={pestList}
              emptyMessage={t('catalog_no_pests')}
            />
          ) : (
            <DataTable<ChemicalRow>
              columns={chemicalColumns}
              data={chemicalList}
              emptyMessage={t('catalog_no_chemicals')}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Retire confirmation modal */}
      <AnimatePresence>
        {retireTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fixed inset-0 bg-black/40"
              onClick={() => setRetireTarget(null)}
            />
            <motion.div
              className="relative z-10 bg-surface rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-md mx-4"
              style={{ border: UI_BORDER, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            >
              <h3 className="text-base font-bold text-text-primary">{t('catalog_retire_title')}</h3>
              <p className="text-sm text-text-muted">{t('catalog_retire_confirm')}</p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setRetireTarget(null)}
                  className="px-4 py-2 text-sm font-medium text-text-muted rounded-xl cursor-pointer hover:bg-surface-subtle transition-colors"
                  style={{ border: UI_BORDER }}
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  disabled={isRetiring}
                  onClick={() => handleRetire(retireTarget)}
                  className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-xl cursor-pointer hover:bg-danger-subtle disabled:opacity-50 transition-colors"
                >
                  {isRetiring ? t('catalog_retiring') : t('catalog_retire')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
