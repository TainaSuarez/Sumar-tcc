'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit,
  Save,
  X,
  Upload,
  Trash2,
  Plus,
  MapPin,
  Calendar,
  CheckCircle,
  Star,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  images: string[];
  goalAmount: number;
  currentAmount: number;
  currency: string;
  type: 'DONATION' | 'CROWDFUNDING';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  location?: string;
  urgencyLevel: number;
  isVerified: boolean;
  isFeatured: boolean;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  subcategoryId?: string;
  creator: {
    id: string;
    firstName: string;
    lastName?: string;
    organizationName?: string;
    avatar?: string;
    userType: 'INDIVIDUAL' | 'ORGANIZATION';
  };
  category: {
    id: string;
    name: string;
    color?: string;
  };
  subcategory?: {
    id: string;
    name: string;
  };
}

interface CampaignEditModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaignId: string, updates: Partial<Campaign>) => void;
}

export function CampaignEditModal({ campaign, isOpen, onClose, onSave }: CampaignEditModalProps) {
  const [formData, setFormData] = useState<Partial<Campaign>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [subcategories, setSubcategories] = useState<Array<{id: string, name: string}>>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description,
        shortDescription: campaign.shortDescription,
        goalAmount: campaign.goalAmount,
        type: campaign.type,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        location: campaign.location,
        urgencyLevel: campaign.urgencyLevel,
        isVerified: campaign.isVerified,
        isFeatured: campaign.isFeatured,
        categoryId: campaign.categoryId,
        subcategoryId: campaign.subcategoryId,
        images: campaign.images
      });
      setNewImages([...campaign.images]);
    }
  }, [campaign]);

  useEffect(() => {
    // Cargar categorías
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Cargar subcategorías cuando cambie la categoría
    if (formData.categoryId) {
      const fetchSubcategories = async () => {
        try {
          const response = await fetch(`/api/categories/${formData.categoryId}/subcategories`);
          if (response.ok) {
            const data = await response.json();
            setSubcategories(data.subcategories || []);
          }
        } catch (error) {
          console.error('Error loading subcategories:', error);
        }
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId]);

  const handleInputChange = (field: keyof Campaign, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddImage = () => {
    setShowImageInput(true);
  };

  const handleConfirmAddImage = () => {
    if (imageUrl && imageUrl.trim()) {
      const updatedImages = [...newImages, imageUrl.trim()];
      setNewImages(updatedImages);
      handleInputChange('images', updatedImages);
      setImageUrl('');
    }
    setShowImageInput(false);
  };

  const handleCancelAddImage = () => {
    setImageUrl('');
    setShowImageInput(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      console.error('El archivo debe ser una imagen');
      return;
    }

    // Validar tamaño (máx. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('La imagen debe ser menor a 5MB');
      return;
    }

    try {
      setUploadingFile(true);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'campaign');

      // Subir archivo al servidor
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const result = await response.json();
      
      // Agregar la URL de la imagen subida
      const updatedImages = [...newImages, result.url];
      setNewImages(updatedImages);
      handleInputChange('images', updatedImages);

    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
      // Limpiar el input file
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);
    handleInputChange('images', updatedImages);
  };

  const handleSave = async () => {
    if (!campaign) return;

    setLoading(true);
    try {
      // Validaciones básicas (logged to console instead of alerts)
      if (!formData.title || formData.title.trim().length < 3) {
        console.error('Validación fallida: El título debe tener al menos 3 caracteres');
        return;
      }

      if (!formData.description || formData.description.trim().length < 10) {
        console.error('Validación fallida: La descripción debe tener al menos 10 caracteres');
        return;
      }

      if (!formData.goalAmount || formData.goalAmount <= 0) {
        console.error('Validación fallida: El objetivo debe ser mayor a 0');
        return;
      }

      if (!formData.categoryId) {
        console.error('Validación fallida: Debe seleccionar una categoría');
        return;
      }

      // Preparar datos para envío
      const updates = {
        ...formData,
        goalAmount: Number(formData.goalAmount),
        urgencyLevel: Number(formData.urgencyLevel)
      };

      await onSave(campaign.id, updates);
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
      // Error logged to console, no alert needed
    } finally {
      setLoading(false);
    }
  };



  if (!campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Campaña
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de la campaña. Los cambios se guardarán inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Título de la campaña"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goalAmount">Objetivo ($) *</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    min="1"
                    value={formData.goalAmount || ''}
                    onChange={(e) => handleInputChange('goalAmount', parseFloat(e.target.value) || 0)}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Descripción Corta</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription || ''}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Resumen breve de la campaña"
                  maxLength={150}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Completa *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe detalladamente tu campaña..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ciudad, País"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de campaña */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Campaña</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DONATION">Donación</SelectItem>
                      <SelectItem value="CROWDFUNDING">Crowdfunding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="ACTIVE">Activa</SelectItem>
                      <SelectItem value="PAUSED">Pausada</SelectItem>
                      <SelectItem value="COMPLETED">Completada</SelectItem>
                      <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgencyLevel">Nivel de Urgencia</Label>
                  <Select 
                    value={formData.urgencyLevel?.toString()} 
                    onValueChange={(value) => handleInputChange('urgencyLevel', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar urgencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Baja</SelectItem>
                      <SelectItem value="2">2 - Media-Baja</SelectItem>
                      <SelectItem value="3">3 - Media</SelectItem>
                      <SelectItem value="4">4 - Media-Alta</SelectItem>
                      <SelectItem value="5">5 - Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategoría</Label>
                  <Select 
                    value={formData.subcategoryId || 'none'} 
                    onValueChange={(value) => handleInputChange('subcategoryId', value === 'none' ? undefined : value)}
                    disabled={!formData.categoryId || subcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin subcategoría</SelectItem>
                      {subcategories.map(subcategory => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                      onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                      onChange={(e) => handleInputChange('endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de visibilidad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visibilidad y Destacados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Label htmlFor="isVerified">Campaña Verificada</Label>
                </div>
                <Switch
                  id="isVerified"
                  checked={formData.isVerified || false}
                  onCheckedChange={(checked) => handleInputChange('isVerified', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <Label htmlFor="isFeatured">Campaña Destacada</Label>
                </div>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured || false}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Imágenes de la Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {/* Botón para agregar imagen */}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                  {uploadingFile ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                      <span className="text-xs text-gray-500 mt-1">Subiendo...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Plus className="h-6 w-6 text-gray-400" />
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={handleAddImage}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Por URL
                        </button>
                        <label className="text-xs text-green-600 hover:text-green-800 font-medium cursor-pointer">
                          Subir archivo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={uploadingFile}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input para agregar imagen */}
              {showImageInput && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                  <Label htmlFor="imageUrl">URL de la imagen</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://ejemplo.com/imagen.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleConfirmAddImage();
                        } else if (e.key === 'Escape') {
                          handleCancelAddImage();
                        }
                      }}
                    />
                    <Button onClick={handleConfirmAddImage} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleCancelAddImage} variant="outline" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Presiona Enter para agregar o Escape para cancelar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estado actual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${campaign.currentAmount.toLocaleString()} UYU
                  </div>
                  <div className="text-sm text-gray-600">Recaudado</div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Progreso</div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {campaign.viewCount}
                  </div>
                  <div className="text-sm text-gray-600">Vistas</div>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {campaign.shareCount}
                  </div>
                  <div className="text-sm text-gray-600">Compartidos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
