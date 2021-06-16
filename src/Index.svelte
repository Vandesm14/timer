<script>
  import Block from './comps/Block.svelte';

  let blocks = [{type: 'timer'}, {type: 'label', label: 'fuck shit'}];
  let interval;

	let current = -1;
	let state = 0; // 0 = stop; 1 = start
	
	const add = (type = 'timer') => {
    blocks = [...blocks, {type}];
  };

	const start = () => {
		current = 0;
		interval = setInterval(() => {

		}, 1000);
	};

	const stop = () => {
		current = -1;
		clearInterval(interval);
	};

	const regenerate = () => {};
</script>

<main>
  <button on:click={()=>add('timer')}>Add Timer</button>
  <button on:click={()=>add('label')}>Add Label</button>
  <button on:click={start}>Start</button>
  <button on:click={stop}>Stop</button>
  {#each blocks as block}
    <Block {block} />
  {/each}
</main>

<style>
	button {
	  padding: 6px 10px;
	  border: 1px solid #585a5d;
	  border-radius: 3px;
	  background-color: #1a1d21;
	  color: inherit;
	  font: inherit;
	}

	button:hover {
	  background-color: #222529;
	}
</style>