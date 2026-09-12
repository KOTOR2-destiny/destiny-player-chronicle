(()=>{
'use strict';

function visiblePlayerSubmissions(){
    return (chronicleState?.submissions || []).filter(item =>
        item && (item.status === 'PENDING' || item.status === 'ACCEPTED')
    );
}

window.renderSubmissions=function(){
    const list=document.getElementById('submission-list');
    if(!list)return;
    list.innerHTML='';

    const submissions=visiblePlayerSubmissions().filter(item =>
        !selectedNpcId || item.npc_id === selectedNpcId
    );

    if(submissions.length===0){
        const empty=document.createElement('div');
        empty.className='empty';
        empty.textContent='NO CREW NOTES FOR THIS CONTACT';
        list.appendChild(empty);
        return;
    }

    submissions.forEach(item=>{
        const card=document.createElement('div');
        card.className='submission-card';

        const top=document.createElement('div');
        top.className='submission-top';
        const kind=document.createElement('div');
        kind.className='submission-kind';
        kind.textContent=(item.kind || 'PERSONAL NOTE') + (item.status === 'ACCEPTED' ? ' // APPROVED' : ' // PENDING');
        const author=document.createElement('div');
        author.className='submission-author';
        author.textContent=item.author || 'UNKNOWN PLAYER';
        top.appendChild(kind); top.appendChild(author);

        const text=document.createElement('div');
        text.className='submission-text';
        text.textContent=item.text || '';
        card.appendChild(top); card.appendChild(text);

        if(currentChronicleUser && item.created_by === currentChronicleUser.id){
            const remove=document.createElement('button');
            remove.className='delete-submission';
            remove.textContent=item.status === 'ACCEPTED' ? 'RETRACT APPROVED NOTE' : 'REMOVE PENDING NOTE';
            remove.onclick=()=>window.deleteSubmission(item.id);
            card.appendChild(remove);
        }
        list.appendChild(card);
    });
};

window.deleteSubmission=async function(id){
    const item=(chronicleState?.submissions || []).find(entry=>entry.id===id);
    if(!item || !currentChronicleUser || item.created_by !== currentChronicleUser.id){
        alert('Only your own crew notes can be removed.');
        return;
    }

    if(item.status === 'PENDING'){
        if(!window.confirm('Remove this pending crew note?'))return;
        const {error}=await destinySupabase.from('player_submissions').delete().eq('id',id);
        if(error){alert('Could not remove note: '+error.message);return;}
    }else if(item.status === 'ACCEPTED'){
        if(!window.confirm('Retract this approved crew note? It will be removed from the GM Archive the next time the Command Console synchronizes submissions, then disappear from the published Chronicle after the GM publishes.'))return;
        const {error}=await destinySupabase.from('player_submissions').update({status:'RETRACTED'}).eq('id',id);
        if(error){alert('Could not retract note: '+error.message);return;}
    }else{
        return;
    }

    await loadState();
};

console.log('[DESTINY CHRONICLE v1.10] player-note lifecycle loaded');
})();
