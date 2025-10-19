/**
 * Archivo de índice para exportar todos los servicios
 */

import aiSearchService from './aiSearch.js';
import { getCurrentLocation, requestLocationPermission } from './location.js';
import { searchImage } from './searchImage.js';
import { storageService } from './storage.js';
import { supabase } from './supabase.js';
import { visionService } from './vision.js';

export {
    aiSearchService,
    getCurrentLocation,
    requestLocationPermission,
    searchImage,
    storageService,
    supabase,
    visionService
};


