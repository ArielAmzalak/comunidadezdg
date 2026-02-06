#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Gerador de números de telefone móvel completos para DDD 92 (Manaus/AM).

Formato de saída: 55 + DDD + 9XXXX + YYYY
Exemplo: 5592991234567, 5592981234567, ...

Gera múltiplos arquivos XLSX com 5000 números cada, numerados em ordem.
Arquivos são salvos em uma pasta com data/hora.

Uso:
    python teste.py                          # Gera 1.000.000 números (padrão)
    python teste.py --quantidade 50000       # Gera 50.000 números
    python teste.py --por-arquivo 10000      # 10.000 números por arquivo
"""

import argparse
import random
import os
from pathlib import Path
from datetime import datetime

import pandas as pd


# Prefixos especificados para DDD 92 (3 dígitos após o 9)
# Formato: 9XX -> números serão 55 92 9XX YY ZZZZ
PREFIXOS_COMUNS_DDD92 = [
    # Faixas 99X
    "991", "992", "993", "994",
    # Faixas 98X
    "981", "982", "983", "984", "985", "986",
]


def gerar_numeros(ddd: str, prefixos: list, quantidade: int) -> list:
    """
    Gera números de telefone completos no formato 55DDXXXXXXXXX (13 dígitos).
    """
    numeros = set()
    numeros_por_prefixo = quantidade // len(prefixos) + 1
    
    for prefixo in prefixos:
        sufixos_gerados = set()
        tentativas = 0
        max_tentativas = numeros_por_prefixo * 3
        
        while len(sufixos_gerados) < numeros_por_prefixo and tentativas < max_tentativas:
            sufixo = random.randint(0, 999999)
            sufixos_gerados.add(sufixo)
            tentativas += 1
        
        for sufixo in sufixos_gerados:
            numero = f"55{ddd}{prefixo}{sufixo:06d}"
            numeros.add(numero)
    
    numeros_lista = list(numeros)
    if len(numeros_lista) > quantidade:
        numeros_lista = random.sample(numeros_lista, quantidade)
    
    random.shuffle(numeros_lista)
    return numeros_lista


def main():
    ap = argparse.ArgumentParser(description="Gerador de números de telefone móvel para DDD 92")
    ap.add_argument("--ddd", default="92", help="DDD/Código de área (padrão: 92)")
    ap.add_argument("--quantidade", type=int, default=1000000, help="Quantidade total de números (padrão: 1.000.000)")
    ap.add_argument("--por-arquivo", type=int, default=5000, help="Números por arquivo XLSX (padrão: 5000)")
    ap.add_argument("--prefixos", default="", help="Prefixos específicos separados por vírgula")
    args = ap.parse_args()

    ddd = args.ddd.strip()
    quantidade = args.quantidade
    por_arquivo = args.por_arquivo
    
    # Usa prefixos customizados ou os padrões
    if args.prefixos:
        prefixos = [p.strip() for p in args.prefixos.split(",")]
    else:
        prefixos = PREFIXOS_COMUNS_DDD92
    
    # Cria pasta com data/hora
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pasta = Path(f"numeros_{timestamp}")
    pasta.mkdir(exist_ok=True)
    
    print(f"🔄 Gerando {quantidade:,} números para DDD {ddd}...")
    print(f"   Prefixos: {', '.join(prefixos)}")
    print(f"   Números por arquivo: {por_arquivo:,}")
    print(f"   Pasta: {pasta.resolve()}\n")
    
    # Gera todos os números
    numeros = gerar_numeros(ddd, prefixos, quantidade)
    total_gerado = len(numeros)
    
    print(f"✅ {total_gerado:,} números únicos gerados!")
    print(f"📂 Salvando em arquivos...\n")
    
    # Divide em arquivos
    num_arquivos = (total_gerado + por_arquivo - 1) // por_arquivo
    
    for i in range(num_arquivos):
        inicio = i * por_arquivo
        fim = min((i + 1) * por_arquivo, total_gerado)
        lote = numeros[inicio:fim]
        
        # Nome do arquivo: lista_001.xlsx, lista_002.xlsx, etc.
        nome_arquivo = pasta / f"lista_{i+1:03d}.xlsx"
        
        df = pd.DataFrame({"numero": lote})
        df.to_excel(nome_arquivo, index=False, engine="openpyxl")
        
        print(f"   💾 {nome_arquivo.name} ({len(lote):,} números)")
    
    print(f"\n✅ Concluído!")
    print(f"   📊 Total de números: {total_gerado:,}")
    print(f"   📁 Total de arquivos: {num_arquivos}")
    print(f"   📂 Pasta: {pasta.resolve()}")


if __name__ == "__main__":
    main()
