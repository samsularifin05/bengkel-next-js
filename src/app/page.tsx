'use client'

import { useState } from 'react'
import CustomerManager from '@/components/CustomerManager'
import ItemManager from '@/components/ItemManager'
import TransactionManager from '@/components/TransactionManager'
import TransactionList from '@/components/TransactionList'

export default function Home() {
  const [activeTab, setActiveTab] = useState('customers')

  const tabs = [
    { id: 'customers', label: 'Customer', component: CustomerManager },
    { id: 'items', label: 'Barang', component: ItemManager },
    { id: 'transactions', label: 'Transaksi', component: TransactionManager },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || CustomerManager

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🔧 Sistem Manajemen Bengkel
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola customer, barang, dan transaksi bengkel Anda
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow-sm">
          <nav className="flex space-x-8 px-6 py-4 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="p-6">
            <ActiveComponent />
          </div>
        </div>
      </div>


    </div>
  )
}
