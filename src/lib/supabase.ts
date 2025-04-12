
// Este arquivo não é mais necessário, estamos usando o cliente integrado do Supabase
// Mantendo o arquivo para compatibilidade com código existente, mas redirecionando para o cliente oficial

import { supabase as officialClient } from '@/integrations/supabase/client';
import { Database } from './types';

// Redirecionar para o cliente oficial
export const supabase = officialClient;

// Flag para verificar se o Supabase está configurado corretamente
export const isSupabaseConfigured = true;
