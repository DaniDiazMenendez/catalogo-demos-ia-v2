// All names, cases and values are fictional; guidance and integrations are illustrative.
export const experiences = [
  {
    id: 'documental', number: '01', category: 'Transversal', icon: '▤', color: 'peach',
    title: 'Documentos que cuentan una historia',
    subtitle: 'Gestión documental inteligente',
    summary: 'De la lectura manual a una revisión con evidencia y decisiones trazables.',
    persona: 'Camila · analista de operaciones', context: 'Camila recibe un remito y una orden de compra ficticios. Antes de registrar la entrega, debe verificar que ambos documentos coincidan.',
    challenge: '¿Cómo detectar diferencias sin revisar cada documento desde cero?',
    metrics: [{value:'2', label:'documentos ficticios'}, {value:'1', label:'diferencia a revisar'}, {value:'100%', label:'decisión humana'}],
    steps: [
      {label:'Recibir', title:'Los documentos llegan al equipo', body:'Orden OC-104: 120 unidades de envases. Remito R-208: 102 unidades. Ambos documentos son ejemplos ficticios.', insight:'Primero identificá qué documentos corresponden a la misma operación. No se procesó ningún archivo real.', evidence:'Orden OC-104 · Remito R-208', action:'Comparar documentos'},
      {label:'Comparar', title:'Una diferencia merece atención', body:'La comparación simulada identifica 18 unidades de diferencia entre lo solicitado y lo informado como entregado.', insight:'Hay una discrepancia de cantidad. Sugerencia: consultar al proveedor antes de registrar la entrega. Verificá los documentos de origen.', evidence:'OC-104: 120 · R-208: 102', action:'Preparar revisión'},
      {label:'Revisar', title:'La decisión queda en manos del equipo', body:'Camila puede dejar la operación pendiente y solicitar una aclaración. La simulación no registra entregas ni envía mensajes.', insight:'Propuesta para revisión: mantener el caso pendiente hasta contar con evidencia corregida. La persona responsable decide.', evidence:'Estado propuesto: pendiente de validación', action:'Volver al inicio'}
    ],
    decisions: [
      {label:'Solicitar aclaración', outcome:'Se propone solicitar al proveedor una aclaración sobre las 18 unidades. No se envió ningún mensaje.'},
      {label:'Derivar a revisión interna', outcome:'Se propone derivar la discrepancia al equipo responsable. No se creó ningún caso.'}
    ],
    architecture: ['Aplicación de revisión', 'Almacenamiento documental', 'Azure AI Document Intelligence', 'Microsoft Foundry + Azure AI Search', 'Validación humana / sistema de gestión'],
    architectureNote:'Referencia propuesta: extracción, búsqueda y generación requieren implementación y evaluación. La demo no conecta archivos ni sistemas.',
    next:'Workshop para elegir un tipo documental, definir campos y acordar un circuito de excepciones.',
    existing:{label:'Abrir demo documental existente', url:'https://danidiazmenendez.github.io/gestion-documental-demo/'}
  },
  {
    id:'farmacia', number:'02', category:'Salud y farmacia', icon:'✳', color:'lavender',
    title:'Una cadena, muchas decisiones',
    subtitle:'Del pedido a la entrega farmacéutica',
    summary:'Recorré cómo equipos y agentes podrían colaborar ante una incidencia logística.',
    persona:'Sofía · coordinación de operaciones', context:'Un pedido ficticio de 1.200 unidades recorre distintas áreas. Una incidencia de transporte exige evaluar una alternativa sin liberar el lote afectado.',
    challenge:'¿Cómo coordinar a los equipos sin perder el control de calidad?',
    metrics:[{value:'1.200',label:'unidades ficticias'}, {value:'1',label:'incidencia logística'}, {value:'✓',label:'revisión humana'}],
    steps:[
      {label:'Pedido',title:'Un pedido pone en marcha la cadena',body:'El equipo recibe una solicitud ficticia y consulta el estado de producción y calidad antes de coordinar la entrega.',insight:'Agrupar pedido, estado de producción y documentación ayudaría a coordinar a las áreas. La información de esta vista es simulada.',evidence:'Pedido de ejemplo · 1.200 unidades',action:'Revisar incidencia'},
      {label:'Incidencia',title:'El envío requiere una alternativa',body:'El transporte previsto presenta una incidencia. El envío afectado permanece retenido mientras el equipo evalúa opciones.',insight:'Se propone revisar un transporte alternativo. Esto no equivale a liberar el producto ni reemplaza la aprobación de Calidad.',evidence:'Envío afectado: retenido',action:'Evaluar alternativa'},
      {label:'Decisión',title:'Una persona revisa el plan',body:'El equipo puede evaluar el plan alternativo según sus procedimientos autorizados. No se envían instrucciones ni se liberan productos.',insight:'La decisión final y las validaciones regulatorias corresponden a los responsables autorizados. La propuesta es ilustrativa.',evidence:'Plan alternativo: pendiente de aprobación',action:'Volver al inicio'}
    ],
    decisions:[
      {label:'Revisar plan alternativo',outcome:'Se propone revisar el plan alternativo. El envío afectado permanece retenido; no se autorizó ni liberó ningún producto.'},
      {label:'Escalar a Calidad',outcome:'Se propone escalar la incidencia a Calidad. El envío permanece retenido y no se envió ninguna notificación.'}
    ],
    architecture:['Aplicaciones por equipo','Sistemas empresariales autorizados','Microsoft Foundry / agentes','Herramientas e integraciones propuestas','Aprobación humana y trazabilidad'],
    architectureNote:'La presentación usa datos y herramientas simulados; no accede a ERP, MES, LIMS, QMS ni sensores. Integración y validación regulatoria quedan por definir.',
    next:'Identificar un proceso, sus responsables y controles antes de definir un piloto.',
    existing:{label:'Abrir experiencia farmacéutica 3D',url:'https://danidiazmenendez.github.io/pharma-agentic-3d/'}
  },
  {
    id:'banca',number:'03',category:'Banca',icon:'◈',color:'mint',
    title:'Un alta, menos fricción',
    subtitle:'Onboarding bancario',
    summary:'Una solicitud de apertura de cuenta con requisitos, documentos y revisión de excepciones.',
    persona:'Lucía · especialista de onboarding',context:'Una clienta ficticia quiere abrir una cuenta. Lucía debe revisar los requisitos y derivar la solicitud si falta documentación.',
    challenge:'¿Cómo orientar a la persona y detectar lo que falta sin automatizar la aprobación?',
    metrics:[{value:'3',label:'requisitos ficticios'},{value:'1',label:'documento pendiente'},{value:'✓',label:'revisión humana'}],
    steps:[
      {label:'Solicitud',title:'Una persona inicia su solicitud',body:'El caso de ejemplo requiere identificación, comprobante de domicilio y formulario de solicitud.',insight:'Un asistente podría explicar los requisitos con información aprobada por el banco. Los requisitos mostrados son ficticios.',evidence:'Solicitud de cuenta · caso sintético',action:'Revisar requisitos'},
      {label:'Requisitos',title:'Un comprobante está pendiente',body:'Identificación y formulario figuran como recibidos; el comprobante de domicilio falta en este caso ficticio.',insight:'Solicitar el comprobante pendiente antes de continuar. No se verificaron identidades ni se consultaron registros externos.',evidence:'2 recibidos · 1 pendiente',action:'Derivar revisión'},
      {label:'Revisión',title:'El equipo conserva la decisión',body:'La solicitud queda pendiente de documentación y revisión. No se abre ninguna cuenta ni se ejecutan controles KYC reales.',insight:'El equipo autorizado debe validar documentos, requisitos regulatorios y criterios del banco antes de decidir.',evidence:'Estado propuesto: pendiente',action:'Volver al inicio'}
    ],
    decisions:[
      {label:'Solicitar documento',outcome:'Se propone pedir el comprobante pendiente. No se envió ninguna solicitud ni se abrió una cuenta.'},
      {label:'Derivar a especialista',outcome:'Se propone derivar el caso para revisión. No se creó una tarea ni se verificó la identidad.'}
    ],
    architecture:['Canal web / atención','Identidad y permisos','Document Intelligence + almacenamiento','Microsoft Foundry + Azure AI Search','Sistema bancario / revisión humana'],
    architectureNote:'Componentes de referencia, no servicios conectados. Cumplimiento, identidad, privacidad y reglas KYC dependen del banco y la jurisdicción.',
    next:'Definir el producto, los requisitos por país y el punto de derivación a una persona.'
  },
  {
    id:'retail',number:'04',category:'Retail',icon:'▦',color:'yellow',
    title:'Que no falte en la góndola',
    subtitle:'Abastecimiento y quiebres de stock',
    summary:'Una señal de inventario se transforma en una propuesta de reposición para revisar.',
    persona:'Mateo · responsable de abastecimiento',context:'Una tienda ficticia tiene 24 unidades de café en inventario y una venta estimada de 8 unidades por día.',
    challenge:'¿Cómo anticipar una posible falta y conversar sobre una reposición?',
    metrics:[{value:'24',label:'unidades en stock'},{value:'8',label:'unidades / día'},{value:'3 días',label:'cobertura estimada'}],
    steps:[
      {label:'Señal',title:'Una señal aparece en el tablero',body:'Para este ejemplo, 24 unidades en stock y una venta estimada de 8 por día equivalen a 3 días de cobertura.',insight:'Cobertura estimada = 24 ÷ 8 = 3 días. Es un cálculo de ejemplo, no un pronóstico entrenado.',evidence:'Inventario: 24 · venta estimada: 8/día',action:'Analizar alternativa'},
      {label:'Alternativa',title:'El plazo importa',body:'Si el proveedor demora 5 días, la cobertura de 3 días es menor al plazo de reposición. Existe un riesgo hipotético de faltante.',insight:'La cobertura es 2 días menor que el plazo supuesto. Revisá stock cercano, demanda y condiciones antes de decidir.',evidence:'Cobertura: 3 días · plazo supuesto: 5 días',action:'Preparar decisión'},
      {label:'Decisión',title:'Una propuesta para el comprador',body:'Mateo puede evaluar una transferencia entre tiendas o una reposición. El ejemplo no verifica disponibilidad ni emite órdenes.',insight:'Comparar una transferencia con una nueva orden sería un próximo paso; la decisión requiere datos y autorización reales.',evidence:'Acción propuesta: revisar opciones',action:'Volver al inicio'}
    ],
    decisions:[
      {label:'Evaluar transferencia',outcome:'Se propone consultar disponibilidad en otra tienda. La disponibilidad no está verificada y no se realizó ninguna transferencia.'},
      {label:'Evaluar una orden',outcome:'Se propone revisar una orden al proveedor. No se calcularon cantidades ni se emitió ninguna orden.'}
    ],
    architecture:['Tablero de abastecimiento','Ventas e inventario autorizados','Microsoft Fabric / modelo de datos','Microsoft Foundry / asistente','ERP y aprobación del comprador'],
    architectureNote:'Los cálculos son fijos y simulados; no hay pronóstico en vivo ni conexión al inventario. La integración y el modelo deben validarse.',
    next:'Elegir una categoría y acordar datos, horizonte de pronóstico y criterios de reposición.'
  },
  {
    id:'mantenimiento',number:'05',category:'Industria',icon:'⚙',color:'blue',
    title:'Una señal antes de la parada',
    subtitle:'Mantenimiento industrial',
    summary:'Datos de activos y documentación se reúnen para apoyar una revisión técnica.',
    persona:'Andrea · coordinadora de mantenimiento',context:'Una bomba ficticia registra una vibración superior a un umbral de ejemplo. Andrea consulta el historial y coordina una inspección.',
    challenge:'¿Cómo dar contexto a una señal sin reemplazar el criterio técnico?',
    metrics:[{value:'7,2',label:'vibración ficticia'},{value:'6,0',label:'umbral de ejemplo'},{value:'1',label:'inspección propuesta'}],
    steps:[
      {label:'Señal',title:'La bomba presenta una alerta',body:'La vibración de ejemplo es 7,2 mm/s y el umbral ilustrativo es 6,0 mm/s. No se reciben datos de sensores reales.',insight:'La lectura supera el umbral ficticio. Una alerta no confirma una falla ni indica una intervención segura.',evidence:'Bomba B-04 · caso ficticio',action:'Consultar contexto'},
      {label:'Contexto',title:'Historial y documentación reunidos',body:'La ficha de ejemplo registra una inspección anterior y remite al procedimiento autorizado del equipo.',insight:'Antes de actuar, contrastar la señal con los manuales vigentes y los procedimientos de seguridad aplicables.',evidence:'Historial y manuales: referencias ficticias',action:'Preparar revisión'},
      {label:'Revisión',title:'El equipo técnico decide',body:'Se propone que personal habilitado revise la alerta conforme al procedimiento aplicable. La demo no controla equipos.',insight:'No efectuar maniobras basadas en esta simulación. La decisión corresponde al personal autorizado y a los procedimientos vigentes.',evidence:'Próximo paso: revisión técnica',action:'Volver al inicio'}
    ],
    decisions:[
      {label:'Proponer inspección',outcome:'Se propone una inspección por personal habilitado, siguiendo los procedimientos vigentes. No se creó una orden ni se controló el equipo.'},
      {label:'Escalar al especialista',outcome:'Se propone consultar al especialista responsable. No se generó una notificación ni se indica ninguna maniobra.'}
    ],
    architecture:['Vista de operaciones','Sensores e historial autorizados','Microsoft Fabric / datos de activos','Azure AI Search + Microsoft Foundry','Especialista / sistema de mantenimiento'],
    architectureNote:'Sensores, búsqueda e integración son propuestos. Los umbrales y procedimientos reales deben ser definidos por especialistas.',
    next:'Seleccionar un activo y validar señales, fuentes, permisos y protocolos de seguridad.'
  },
  {
    id:'agro',number:'06',category:'Agro',icon:'✿',color:'lime',
    title:'Cada lote tiene contexto',
    subtitle:'Rendimiento y trazabilidad agrícola',
    summary:'Datos de cosecha y documentación para entender diferencias y orientar una conversación.',
    persona:'Elena · responsable de operaciones agrícolas',context:'Dos lotes ficticios de soja registran rendimientos distintos. Elena quiere revisar los datos y la documentación antes de sacar conclusiones.',
    challenge:'¿Cómo convertir datos dispersos en una pregunta útil para el equipo?',
    metrics:[{value:'3,2',label:'t/ha · lote norte'},{value:'2,6',label:'t/ha · lote sur'},{value:'0,6',label:'t/ha · diferencia'}],
    steps:[
      {label:'Datos',title:'Dos lotes, resultados distintos',body:'En el ejemplo, el lote norte registra 3,2 t/ha y el lote sur 2,6 t/ha. La diferencia es de 0,6 t/ha.',insight:'La diferencia es descriptiva: estos datos por sí solos no explican la causa ni permiten recomendar acciones.',evidence:'Norte: 3,2 t/ha · sur: 2,6 t/ha',action:'Explorar contexto'},
      {label:'Contexto',title:'Buscar evidencia antes de concluir',body:'El equipo podría contrastar registros de manejo, fechas y documentación asociados a cada lote.',insight:'Una hipótesis requiere más información y revisión agronómica. La demo no consulta clima, documentos ni bases reales.',evidence:'Registros y documentación: por integrar',action:'Preparar conversación'},
      {label:'Conversación',title:'La siguiente pregunta es humana',body:'Elena lleva la comparación al equipo para investigar posibles factores. No se genera una recomendación agronómica.',insight:'Próximo paso sugerido: identificar qué datos faltan y consultar a un profesional del área.',evidence:'Acción propuesta: revisar con el equipo',action:'Volver al inicio'}
    ],
    decisions:[
      {label:'Revisar registros',outcome:'Se propone reunir los registros de manejo de ambos lotes. La demo no accede a documentos reales.'},
      {label:'Consultar al equipo',outcome:'Se propone revisar la diferencia con un profesional del área. No se envió una consulta ni se emitió una recomendación agronómica.'}
    ],
    architecture:['Tablero de campo','Datos de lotes y documentos','Microsoft Fabric / Power BI','Microsoft Foundry + búsqueda documental','Equipo agronómico / revisión'],
    architectureNote:'Datos, análisis e integraciones son ilustrativos. No hay acceso a clima, telemetría ni documentos reales.',
    next:'Acordar qué lotes, indicadores y fuentes pueden usarse en una exploración con datos autorizados.'
  }
];
