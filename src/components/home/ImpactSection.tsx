
import React from 'react';

const ImpactSection = () => {
  return (
    <section className="px-4 pb-4" aria-labelledby="impact-title">
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 id="impact-title" className="text-lg font-heading font-bold text-cv-purple-dark mb-4 text-center">
          Nosso Impacto
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center" role="grid">
          <div className="space-y-2" role="gridcell">
            <div className="text-xl sm:text-2xl font-bold text-cv-green-mint" aria-label="Duas mil e quinhentas famílias atendidas">2.5K+</div>
            <p className="text-xs sm:text-sm text-cv-purple-dark leading-tight">Famílias Atendidas</p>
          </div>
          <div className="space-y-2" role="gridcell">
            <div className="text-xl sm:text-2xl font-bold text-cv-coral" aria-label="Noventa e oito por cento de satisfação">98%</div>
            <p className="text-xs sm:text-sm text-cv-purple-dark leading-tight">Satisfação</p>
          </div>
          <div className="space-y-2" role="gridcell">
            <div className="text-xl sm:text-2xl font-bold text-cv-blue-heart" aria-label="Quinze especialistas">15</div>
            <p className="text-xs sm:text-sm text-cv-purple-dark leading-tight">Especialistas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
