// src/services/paymentService.ts
import { supabase } from './supabase';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Payment } from '../types';
import { Patient } from '../types';

export const getPayments = async (patientId: string) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('patient_id', patientId)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('payments').insert(paymentData).select().single();

  if (error) throw error;
  return data;
};

export const generateReceipt = async (payment: Payment, patient: Patient) => {
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .clinic-name { font-size: 24px; font-weight: bold; }
          .receipt-title { font-size: 20px; margin: 10px 0; }
          .details { margin: 20px 0; }
          .detail-row { display: flex; margin-bottom: 8px; }
          .detail-label { font-weight: bold; width: 150px; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          .signature { margin-top: 50px; border-top: 1px solid #000; width: 200px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">X-Clinic</div>
          <div class="receipt-title">RECIBO DE PAGO</div>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <div class="detail-label">Fecha:</div>
            <div>${new Date(payment.payment_date).toLocaleDateString()}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Paciente:</div>
            <div>${patient.full_name}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Monto:</div>
            <div>$${payment.amount.toFixed(2)}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Método de pago:</div>
            <div>${payment.payment_method}</div>
          </div>
          ${payment.notes ? `
            <div class="detail-row">
              <div class="detail-label">Notas:</div>
              <div>${payment.notes}</div>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <div>¡Gracias por su preferencia!</div>
          <div class="signature"></div>
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  
  // Guardar en Supabase Storage
  const fileExt = '.pdf';
  const fileName = `receipts/${payment.id}${fileExt}`;
  
  const fileUri = uri;
const response = await fetch(fileUri);
const blob = await response.blob();

const { error: uploadError } = await supabase.storage
  .from('receipts')
  .upload(fileName, blob);


  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);

  // Actualizar el pago con la URL del recibo
  const { data, error } = await supabase
    .from('payments')
    .update({ receipt_url: urlData.publicUrl })
    .eq('id', payment.id)
    .select()
    .single();

  if (error) throw error;

  return { ...data, localUri: uri };
};

export const shareReceipt = async (uri: string) => {
  if (!(await Sharing.isAvailableAsync())) {
    alert('Sharing is not available on your platform');
    return;
  }
  
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartir recibo',
  });
};