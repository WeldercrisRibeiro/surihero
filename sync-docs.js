import fs from 'fs';
import path from 'path';

const DOCS = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    slug: 'bem-vindo',
    title: 'Bem-vindo ao Suri Tools',
    category: 'Introdução',
    filePath: 'public/docs/1-introducao/bem-vindo.md',
    banner_from: '#0a1172',
    banner_to: '#3a0ca3',
    banner_title: 'Suri Tools',
    banner_subtitle: 'Plataforma interna de ferramentas do time',
    author_name: 'Weldercris Ribeiro',
    author_role: 'Tech Lead'
  },
  {
    id: '00000000-0000-0000-0000-000000000020',
    slug: 'suri-api',
    title: 'Suri API',
    category: 'Módulos',
    filePath: 'public/docs/2-modulos/suri-api.md',
    author_name: 'Weldercris Ribeiro',
    author_role: 'Tech Lead'
  },
  {
    id: '00000000-0000-0000-0000-000000000030',
    slug: 'suri-calcs',
    title: 'Suri Calcs',
    category: 'Módulos',
    filePath: 'public/docs/2-modulos/suri-calcs.md',
    author_name: 'Weldercris Ribeiro',
    author_role: 'Tech Lead'
  },
  {
    id: '00000000-0000-0000-0000-000000000040',
    slug: 'kanban',
    title: 'Kanban',
    category: 'Módulos',
    filePath: 'public/docs/2-modulos/kanban.md',
    author_name: 'Weldercris Ribeiro',
    author_role: 'Tech Lead'
  },
  {
    id: '00000000-0000-0000-0000-000000000050',
    slug: 'workflow',
    title: 'Flows',
    category: 'Módulos',
    filePath: 'public/docs/2-modulos/workflow.md',
    author_name: 'Weldercris Ribeiro',
    author_role: 'Tech Lead'
  }
];

async function sync() {
  console.log('Iniciando sincronização das documentações...');
  for (const doc of DOCS) {
    try {
      const content = fs.readFileSync(path.resolve(doc.filePath), 'utf-8');
      const payload = {
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        category: doc.category,
        content: content,
        author_name: doc.author_name,
        author_role: doc.author_role,
        banner_from: doc.banner_from || null,
        banner_to: doc.banner_to || null,
        banner_title: doc.banner_title || null,
        banner_subtitle: doc.banner_subtitle || null,
        updated_at: new Date().toISOString()
      };

      const url = `http://localhost:3000/documents?slug=eq.${doc.slug}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`✓ Sincronizado: ${doc.title}`);
      } else {
        // Se falhar ou não encontrar para atualizar, insere de forma segura
        const insertUrl = 'http://localhost:3000/documents';
        const insertResponse = await fetch(insertUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });
        if (insertResponse.ok) {
          console.log(`+ Criado e Sincronizado: ${doc.title}`);
        } else {
          console.error(`✗ Erro ao sincronizar ${doc.title}:`, await insertResponse.text());
        }
      }
    } catch (err) {
      console.error(`✗ Erro ao sincronizar ${doc.title}:`, err.message);
    }
  }
  console.log('Sincronização concluída!');
}

sync();
