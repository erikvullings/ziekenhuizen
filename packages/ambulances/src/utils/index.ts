const pcFormatter = /(\d{4})\s*(\w{2})/gm;

export const formatPC = (pc?: string) =>
  pc && pcFormatter.test(pc) ? pc.replace(pcFormatter, '$1 $2').toUpperCase() : pc;
