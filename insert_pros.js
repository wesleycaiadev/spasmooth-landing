const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const prosToInsert = [
        {
            name: 'Clara',
            specialties: ['Terapia Tântrica', 'Massagem Relaxante Especial', 'Vivência Delirium'],
            photo_url: '/images/professionals/clara/avatar.jpg',
            location: 'Aracaju',
            active: true
        },
        {
            name: 'Maria',
            specialties: ['Terapia Tântrica', 'Massagem Nuru', 'Tailandesa'],
            photo_url: '/images/professionals/maria/avatar.jpg',
            location: 'Aracaju',
            active: true
        },
        {
            name: 'Anne',
            specialties: ['Massagem Relaxante Especial', 'Ventosa com Relaxante', 'Vivência Premium Black'],
            photo_url: '/images/professionals/anne/avatar.jpg',
            location: 'Aracaju',
            active: true
        }
    ];

    for (const pro of prosToInsert) {
        // Verifica se já existe
        const { data: existing } = await supabase.from('professionals').select('id').eq('name', pro.name);

        if (!existing || existing.length === 0) {
            const { error } = await supabase.from('professionals').insert([pro]);
            if (error) console.error("Erro ao inserir " + pro.name + ":", error);
            else console.log("Inserida: " + pro.name);
        } else {
            console.log(pro.name + " já estava no banco.");
        }
    }
}

main();
