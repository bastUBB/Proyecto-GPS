import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react';

export default function EvaluacionStats({ evaluaciones }) {
  if (!evaluaciones || evaluaciones.length === 0) {
    return null;
  }

  const totalEvaluaciones = evaluaciones.length;
  const promedioCalificacion = evaluaciones.reduce((sum, evaluacion) => sum + evaluacion.calificacion, 0) / totalEvaluaciones;
  const evaluacionesAnonimas = evaluaciones.filter(evaluacion => evaluacion.visibilidad === 'Anónima').length;
  const evaluacionesRecientes = evaluaciones.filter(evaluacion => {
    const fechaEval = new Date(evaluacion.fecha);
    const unMesAtras = new Date();
    unMesAtras.setMonth(unMesAtras.getMonth() - 1);
    return fechaEval >= unMesAtras;
  }).length;

  const renderStars = (calificacion) => {
    const stars = [];
    const fullStars = Math.floor(calificacion);
    const hasHalfStar = calificacion % 1 !== 0;
    
    for (let i = 1; i <= 7; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Resumen de Evaluaciones
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">{totalEvaluaciones}</div>
          <div className="text-sm opacity-90">Evaluaciones Totales</div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            {renderStars(promedioCalificacion)}
          </div>
          <div className="text-2xl font-bold">{promedioCalificacion.toFixed(1)}/7</div>
          <div className="text-sm opacity-90">Promedio General</div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <Users className="w-8 h-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">{evaluacionesAnonimas}</div>
          <div className="text-sm opacity-90">Evaluaciones Anónimas</div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">{evaluacionesRecientes}</div>
          <div className="text-sm opacity-90">Este Mes</div>
        </div>
      </div>
    </div>
  );
}
