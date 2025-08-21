'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  Settings,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CampaignSelectorModal } from './CampaignSelector';

interface BulkAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  confirmationRequired: boolean;
  dangerLevel: 'low' | 'medium' | 'high';
}

const bulkActions: BulkAction[] = [
  {
    id: 'bulk_activate',
    label: 'Activar Campañas',
    description: 'Cambia el estado de las campañas seleccionadas a ACTIVA',
    icon: <Play className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'bulk_pause',
    label: 'Pausar Campañas',
    description: 'Cambia el estado de las campañas seleccionadas a PAUSADA',
    icon: <Pause className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    confirmationRequired: true,
    dangerLevel: 'medium'
  },
  {
    id: 'bulk_verify',
    label: 'Verificar Campañas',
    description: 'Marca las campañas seleccionadas como verificadas',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'bulk_unverify',
    label: 'Desverificar Campañas',
    description: 'Quita la verificación de las campañas seleccionadas',
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    confirmationRequired: true,
    dangerLevel: 'medium'
  },
  {
    id: 'bulk_feature',
    label: 'Destacar Campañas',
    description: 'Marca las campañas seleccionadas como destacadas',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'bulk_unfeature',
    label: 'Quitar Destacado',
    description: 'Quita el destacado de las campañas seleccionadas',
    icon: <Settings className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    confirmationRequired: false,
    dangerLevel: 'low'
  },
  {
    id: 'bulk_cancel',
    label: 'Cancelar Campañas',
    description: 'Cambia el estado de las campañas seleccionadas a CANCELADA (IRREVERSIBLE)',
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    confirmationRequired: true,
    dangerLevel: 'high'
  }
];

interface BulkCampaignActionsProps {
  onActionComplete?: (action: string, affectedCount: number) => void;
}

export function BulkCampaignActions({ onActionComplete }: BulkCampaignActionsProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const executeAction = async (campaignIds: string[], actionId: string) => {
    const action = bulkActions.find(a => a.id === actionId);
    if (!action) return;

    if (action.confirmationRequired) {
      setSelectedCampaigns(campaignIds);
      setSelectedAction(actionId);
      setShowConfirmDialog(true);
      return;
    }

    await performAction(campaignIds, actionId);
  };

  const performAction = async (campaignIds: string[], actionId: string) => {
    try {
      setIsExecuting(true);
      
      const response = await fetch('/api/admin/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionId,
          campaignIds
        }),
      });

      if (!response.ok) {
        throw new Error('Error al ejecutar la acción masiva');
      }

      const result = await response.json();
      
      if (onActionComplete) {
        onActionComplete(actionId, result.affectedRows);
      }

      alert(`✅ Acción ejecutada exitosamente en ${result.affectedRows} campañas`);
      setShowConfirmDialog(false);
      setSelectedCampaigns([]);
      setSelectedAction('');

    } catch (err) {
      alert(`❌ ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const confirmAction = async () => {
    await performAction(selectedCampaigns, selectedAction);
  };

  const getActionByDangerLevel = (level: 'low' | 'medium' | 'high') => {
    return bulkActions.filter(action => action.dangerLevel === level);
  };

  const selectedActionData = bulkActions.find(a => a.id === selectedAction);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Acciones Masivas en Campañas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            Selecciona una acción y luego elige las campañas sobre las que aplicarla.
            Las acciones se ejecutarán inmediatamente en todas las campañas seleccionadas.
          </p>

          {/* Acciones de bajo riesgo */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Acciones Seguras
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {getActionByDangerLevel('low').map((action) => (
                  <CampaignSelectorModal
                    key={action.id}
                    onSelectionConfirm={(ids) => executeAction(ids, action.id)}
                    title={`${action.label} - Seleccionar Campañas`}
                    description={action.description}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start h-auto p-4 ${action.color}`}
                      disabled={isExecuting}
                    >
                      <div className="flex items-center gap-3">
                        {action.icon}
                        <div className="text-left">
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs opacity-75">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  </CampaignSelectorModal>
                ))}
              </div>
            </div>

            {/* Acciones de riesgo medio */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Acciones con Confirmación
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getActionByDangerLevel('medium').map((action) => (
                  <CampaignSelectorModal
                    key={action.id}
                    onSelectionConfirm={(ids) => executeAction(ids, action.id)}
                    title={`${action.label} - Seleccionar Campañas`}
                    description={action.description}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start h-auto p-4 ${action.color}`}
                      disabled={isExecuting}
                    >
                      <div className="flex items-center gap-3">
                        {action.icon}
                        <div className="text-left">
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs opacity-75">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  </CampaignSelectorModal>
                ))}
              </div>
            </div>

            {/* Acciones peligrosas */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Acciones Peligrosas
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {getActionByDangerLevel('high').map((action) => (
                  <CampaignSelectorModal
                    key={action.id}
                    onSelectionConfirm={(ids) => executeAction(ids, action.id)}
                    title={`${action.label} - Seleccionar Campañas`}
                    description={action.description}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start h-auto p-4 ${action.color} border-2`}
                      disabled={isExecuting}
                    >
                      <div className="flex items-center gap-3">
                        {action.icon}
                        <div className="text-left">
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs opacity-75">{action.description}</div>
                        </div>
                      </div>
                    </Button>
                  </CampaignSelectorModal>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Confirmar Acción Masiva
            </DialogTitle>
            <DialogDescription>
              Esta acción afectará a múltiples campañas. Por favor confirma que deseas continuar.
            </DialogDescription>
          </DialogHeader>
          
          {selectedActionData && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  {selectedActionData.icon}
                  <h4 className="font-medium">{selectedActionData.label}</h4>
                </div>
                <p className="text-sm text-gray-600">{selectedActionData.description}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Campañas afectadas:</span>
                <Badge variant="outline">{selectedCampaigns.length}</Badge>
              </div>

              {selectedActionData.dangerLevel === 'high' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Esta acción es irreversible. Las campañas canceladas no pueden ser reactivadas.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={isExecuting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={isExecuting}
              className={selectedActionData?.dangerLevel === 'high' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isExecuting ? 'Ejecutando...' : 'Confirmar Acción'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
