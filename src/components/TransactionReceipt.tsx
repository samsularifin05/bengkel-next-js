'use client';

import React from 'react';

interface Service {
    nama_jasa: string;
    harga: number;
}

interface Item {
    nama_barang: string;
    quantity: number;
    harga: number;
}

interface ReceiptData {
    no_transaksi: string;
    tanggal_transaksi: string;
    type_pelanggan: string;
    customer_name: string;
    no_hp_customer?: string;
    services: Service[];
    items: Item[];
    total_amount: number;
}

interface TransactionReceiptProps {
    receiptData: ReceiptData;
    onClose: () => void;
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ receiptData, onClose }) => {
    const handlePrint = () => {
        // Buat window baru full screen untuk print thermal
        const printWindow = window.open('', '_blank', 'width=' + screen.width + ',height=' + screen.height + ',scrollbars=yes,resizable=yes');

        if (printWindow) {
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Receipt Print</title>
                    <meta charset="UTF-8">
                    <style>
                        @page {
                            size: 80mm auto;
                            margin: 5mm 2mm;
                        }
                        body {
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            line-height: 1.3;
                            margin: 0;
                            padding: 0;
                            background: #f5f5f5;
                            display: flex;
                            justify-content: center;
                            align-items: flex-start;
                            min-height: 100vh;
                            padding-top: 50px;
                        }
                        .receipt-container {
                            width: 80mm;
                            background: white;
                            padding: 10px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            color: #000;
                        }
                        .center { text-align: center; }
                        .bold { font-weight: bold; }
                        .receipt-header {
                            border-bottom: 1px dashed #000;
                            padding-bottom: 5px;
                            margin-bottom: 10px;
                        }
                        .receipt-section {
                            margin: 10px 0;
                        }
                        .receipt-row {
                            display: flex;
                            justify-content: space-between;
                            margin: 2px 0;
                        }
                        .receipt-total {
                            border-top: 1px dashed #000;
                            padding-top: 5px;
                            margin-top: 10px;
                            font-weight: bold;
                            font-size: 14px;
                        }
                        .receipt-footer {
                            border-top: 1px dashed #000;
                            padding-top: 5px;
                            margin-top: 10px;
                            text-align: center;
                            font-size: 10px;
                        }
                        .item-detail {
                            font-size: 10px;
                            color: #666;
                            margin-left: 10px;
                        }
                        @media print {
                            body {
                                background: white !important;
                                padding: 0 !important;
                            }
                            .receipt-container {
                                box-shadow: none !important;
                                width: 72mm !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-container">
                        <div class="receipt-header center">
                            <div class="bold" style="font-size: 16px;">BENGKEL RECEIPT</div>
                            <div>Slip Transaksi</div>
                        </div>

                        <div class="receipt-section">
                            <div class="receipt-row">
                                <span>No. Transaksi:</span>
                                <span class="bold">${receiptData.no_transaksi}</span>
                            </div>
                            <div class="receipt-row">
                                <span>Tanggal:</span>
                                <span>${new Date(receiptData.tanggal_transaksi).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div class="receipt-row">
                                <span>Jam:</span>
                                <span>${new Date(receiptData.tanggal_transaksi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div class="receipt-section">
                            <div class="receipt-row">
                                <span>Customer:</span>
                                <span class="bold">${receiptData.customer_name}</span>
                            </div>
                            ${receiptData.no_hp_customer ? `
                            <div class="receipt-row">
                                <span>No. HP:</span>
                                <span>${receiptData.no_hp_customer}</span>
                            </div>` : ''}
                            <div class="receipt-row">
                                <span>Tipe:</span>
                                <span style="text-transform: capitalize;">${receiptData.type_pelanggan}</span>
                            </div>
                        </div>

                        ${receiptData.services && receiptData.services.length > 0 ? `
                        <div class="receipt-section">
                            <div class="bold">JASA:</div>
                            ${receiptData.services.map(service => `
                            <div class="receipt-row">
                                <span>${service.nama_jasa}</span>
                                <span>Rp ${service.harga.toLocaleString('id-ID')}</span>
                            </div>
                            `).join('')}
                        </div>` : ''}

                        ${receiptData.items && receiptData.items.length > 0 ? `
                        <div class="receipt-section">
                            <div class="bold">BARANG:</div>
                            ${receiptData.items.map(item => `
                            <div>
                                <div class="receipt-row">
                                    <span>${item.nama_barang}</span>
                                    <span>Rp ${(item.quantity * item.harga).toLocaleString('id-ID')}</span>
                                </div>
                                <div class="item-detail">${item.quantity} x Rp ${item.harga.toLocaleString('id-ID')}</div>
                            </div>
                            `).join('')}
                        </div>` : ''}

                        <div class="receipt-total center">
                            <div class="receipt-row">
                                <span>TOTAL:</span>
                                <span>Rp ${receiptData.total_amount.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                                                <div class="receipt-footer">
                            <div>Terima kasih atas kunjungan Anda!</div>
                            <div>Barang yang sudah dibeli tidak dapat dikembalikan</div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();

            // Auto print setelah window load
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                    onClose()
                }, 100);
            };
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop dengan gradient dan blur effect */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-gradient-to-br from-gray-900/50 via-gray-800/60 to-gray-900/50 backdrop-blur-sm transition-all duration-300"
                style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%), rgba(0, 0, 0, 0.4)'
                }}
            ></div>

            {/* Receipt Container */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 text-center">BENGKEL RECEIPT</h2>
                        <p className="text-sm text-gray-600 text-center mt-1">Slip Transaksi</p>
                    </div>

                    {/* Receipt Content */}
                    <div className="p-6 space-y-4" id="receipt-content">
                        {/* Transaction Info */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">No. Transaksi:</span>
                                <span className="font-semibold text-gray-800">{receiptData.no_transaksi}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tanggal:</span>
                                <span className="font-medium text-gray-800">
                                    {new Date(receiptData.tanggal_transaksi).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Jam:</span>
                                <span className="font-medium text-gray-800">
                                    {new Date(receiptData.tanggal_transaksi).toLocaleTimeString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Customer Info */}
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Customer:</span>
                                <span className="font-medium text-gray-800">{receiptData.customer_name}</span>
                            </div>
                            {receiptData.no_hp_customer && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">No. HP:</span>
                                    <span className="font-medium text-gray-800">{receiptData.no_hp_customer}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipe:</span>
                                <span className="font-medium text-gray-800 capitalize">{receiptData.type_pelanggan}</span>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Services */}
                        {receiptData.services && receiptData.services.length > 0 && (
                            <div className="text-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">JASA:</h4>
                                <div className="space-y-2">
                                    {receiptData.services.map((service, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-gray-700 flex-1">{service.nama_jasa}</span>
                                            <span className="font-medium text-gray-800 ml-4">
                                                Rp {service.harga.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <hr className="border-gray-200 mt-3" />
                            </div>
                        )}

                        {/* Items */}
                        {receiptData.items && receiptData.items.length > 0 && (
                            <div className="text-sm">
                                <h4 className="font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-1">BARANG:</h4>
                                <div className="space-y-2">
                                    {receiptData.items.map((item, index) => (
                                        <div key={index} className="border-b border-gray-50 last:border-0 pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="text-gray-700 font-medium">{item.nama_barang}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {item.quantity} x Rp {item.harga.toLocaleString('id-ID')} per unit
                                                    </div>
                                                </div>
                                                <span className="font-medium text-gray-800 ml-4">
                                                    Rp {(item.quantity * item.harga).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <hr className="border-gray-200 mt-3" />
                            </div>
                        )}

                        <hr className="border-gray-300 border-t-2" />

                        {/* Total */}
                        <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                            <span>TOTAL:</span>
                            <span>Rp {receiptData.total_amount.toLocaleString('id-ID')}</span>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Footer */}
                        <div className="text-center text-xs text-gray-500 space-y-1">
                            <p>Terima kasih atas kunjungan Anda!</p>
                            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 border-t border-gray-200 flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Print
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    .fixed {
                        position: static !important;
                    }
                    .bg-black {
                        background: transparent !important;
                    }
                    .backdrop-blur-sm {
                        backdrop-filter: none !important;
                    }
                    button {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default TransactionReceipt;
