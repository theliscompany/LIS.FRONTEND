export const DEFAULT_QUOTE_TEMPLATE = {
  name: 'Template Devis Standard',
  subject: 'Devis {{quoteNumber}} - {{company.name}}',
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Devis {{quoteNumber}}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #fff; }
        .quote-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .option { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .price { font-size: 1.2em; font-weight: bold; color: #28a745; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .btn { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px; }
        .btn-primary { background-color: #007bff; color: white; }
        .btn-secondary { background-color: #6c757d; color: white; }
        .company-info { font-size: 0.9em; color: #666; }
        .validity { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 2em;">Devis {{quoteNumber}}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">{{company.name}}</p>
        </div>
        
        <div class="content">
          <p>Bonjour {{customer.name}},</p>
          
          <p>Nous avons le plaisir de vous présenter notre devis pour votre transport de <strong>{{transport.product}}</strong>.</p>
          
          <div class="quote-details">
            <h3 style="margin-top: 0; color: #495057;">Détails du transport</h3>
            <p><strong>Lieu de départ:</strong> {{transport.from}}</p>
            <p><strong>Lieu d'arrivée:</strong> {{transport.to}}</p>
            <p><strong>Produit:</strong> {{transport.product}}</p>
            <p><strong>Quantité:</strong> {{transport.quantity}} {{transport.unit}}</p>
            <p><strong>Date de création:</strong> {{formatDate createdAt "dd/MM/yyyy"}}</p>
          </div>
          
          {{#if options}}
          <h3 style="color: #495057;">Options proposées</h3>
          {{#each options}}
          <div class="option">
            <h4 style="margin-top: 0;">{{description}}</h4>
            <p class="price">{{formatCurrency totalPrice currency}}</p>
            {{#if details}}
            <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
              <p><strong>Détails:</strong></p>
              {{#if details.haulage}}
              <p>• Transport terrestre: {{details.haulage.carrierName}}</p>
              {{/if}}
              {{#if details.seaFreight}}
              <p>• Fret maritime: {{details.seaFreight.vesselName}}</p>
              {{/if}}
              {{#if details.miscellaneous}}
              <p>• Services additionnels: {{details.miscellaneous.length}} service(s)</p>
              {{/if}}
            </div>
            {{/if}}
          </div>
          {{/each}}
          {{/if}}
          
          {{#if expiresAt}}
          <div class="validity">
            <p style="margin: 0;"><strong>⚠️ Important:</strong> Ce devis est valable jusqu'au {{formatDate expiresAt "dd/MM/yyyy"}}.</p>
          </div>
          {{/if}}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="btn btn-primary">✅ Accepter le devis</a>
            <a href="#" class="btn btn-secondary">❌ Refuser le devis</a>
          </div>
          
          <p>Pour toute question concernant ce devis, n'hésitez pas à nous contacter.</p>
          
          <p>Cordialement,<br>
          <strong>L'équipe {{company.name}}</strong></p>
        </div>
        
        <div class="footer">
          <div class="company-info">
            <p><strong>{{company.name}}</strong></p>
            <p>{{company.address}}</p>
            <p>📞 {{company.phone}} | 📧 {{company.email}}</p>
            <p>🌐 <a href="{{company.website}}" style="color: #007bff;">{{company.website}}</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  textBody: `
    Devis {{quoteNumber}} - {{company.name}}
    ============================================
    
    Bonjour {{customer.name}},
    
    Nous avons le plaisir de vous présenter notre devis pour votre transport de {{transport.product}}.
    
    DÉTAILS DU TRANSPORT:
    - Lieu de départ: {{transport.from}}
    - Lieu d'arrivée: {{transport.to}}
    - Produit: {{transport.product}}
    - Quantité: {{transport.quantity}} {{transport.unit}}
    - Date de création: {{formatDate createdAt "dd/MM/yyyy"}}
    
    {{#if options}}
    OPTIONS PROPOSÉES:
    {{#each options}}
    - {{description}}: {{formatCurrency totalPrice currency}}
    {{/each}}
    {{/if}}
    
    {{#if expiresAt}}
    ⚠️  IMPORTANT: Ce devis est valable jusqu'au {{formatDate expiresAt "dd/MM/yyyy"}}.
    {{/if}}
    
    Pour accepter ou refuser ce devis, veuillez nous contacter.
    
    Cordialement,
    L'équipe {{company.name}}
    
    {{company.name}}
    {{company.address}}
    Tél: {{company.phone}}
    Email: {{company.email}}
    Site: {{company.website}}
  `
};

export const QUOTE_TEMPLATE_PLACEHOLDERS = [
  // Informations du devis
  'quoteNumber',
  'quoteId',
  'status',
  'createdAt',
  'expiresAt',
  
  // Informations client
  'customer.name',
  'customer.email',
  'customer.company',
  'customer.phone',
  
  // Informations de transport
  'transport.from',
  'transport.to',
  'transport.product',
  'transport.quantity',
  'transport.unit',
  
  // Options et prix
  'options[].id',
  'options[].description',
  'options[].totalPrice',
  'options[].currency',
  'options[].details',
  
  // Informations de l'entreprise
  'company.name',
  'company.address',
  'company.phone',
  'company.email',
  'company.website'
];

export const QUOTE_TEMPLATE_HELPERS = {
  formatDate: (date: string, format: string) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    if (format === 'dd/MM/yyyy') {
      return d.toLocaleDateString('fr-FR');
    }
    return d.toLocaleDateString();
  },
  
  formatCurrency: (amount: number, currency: string = 'EUR') => {
    if (!amount) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  }
};
