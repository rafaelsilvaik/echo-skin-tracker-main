
import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hook para detectar quando a página fica visível ou invisível
 * Útil para recarregar dados quando o usuário volta para a aba
 */
export function usePageVisibility(callback: () => void) {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const callbackRef = useRef(callback);

  // Atualize a referência do callback quando o callback mudar
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      // Se a página ficou visível, execute o callback
      if (visible) {
        callbackRef.current();
      }
    };

    // Adiciona o evento de mudança de visibilidade
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Executa o callback na montagem do componente
    if (!document.hidden) {
      callbackRef.current();
    }
    
    // Remove o evento quando o componente é desmontado
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Não depende mais do callback diretamente

  return isVisible;
}
