
import React from 'react';

const ImpactSection = () => {
  return (
    <section className="px-4 pb-6" aria-labelledby="impact-title">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <h3 id="impact-title" className="text-xl font-heading font-bold text-cv-purple-dark mb-4 text-center">
          Nosso Impacto
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center" role="grid">
          <div className="space-y-1" role="gridcell">
            <div className="text-2xl font-bold text-cv-green-mint" aria-label="Duas mil e quinhentas famílias atendidas">2.5K+</div>
            <p className="text-xs text-cv-purple-dark">Famílias Atendidas</p>
          </div>
          <div className="space-y-1" role="gridcell">
            <div className="text-2xl font-bold text-cv-coral" aria-label="Noventa e oito por cento de satisfação">98%</div>
            <p className="text-xs text-cv-purple-dark">Satisfação</p>
          </div>
          <div className="space-y-1" role="gridcell">
            <div className="text-2xl font-bold text-cv-blue-heart" aria-label="Quinze especialistas">15</div>
            <p className="text-xs text-cv-purple-dark">Especialistas</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
